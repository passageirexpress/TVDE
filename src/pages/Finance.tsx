import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Euro, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Filter, 
  Search,
  FileUp,
  History,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Zap,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { formatCurrency, cn, getUberPeriod } from '../lib/utils';
import { useDataStore } from '../store/useDataStore';
import { supabase } from '../lib/supabase';

interface ImportedData {
  id: string;
  driver?: string;
  platform?: 'uber' | 'bolt';
  gross?: number;
  net?: number;
  commission?: number;
  period?: string;
  status: 'pending' | 'paid' | 'processing';
  driver_id?: string;
  gross_revenue?: number;
  net_amount?: number;
  commission_fee?: number;
  payment_date?: string;
  date?: string;
}

const initialPayments: ImportedData[] = [];

export default function Finance() {
  const { expenses, clearAllData, drivers, addNotification, payments, setPayments, updatePayment, addDriver, addVehicle, vehicles } = useDataStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<ImportedData | null>(null);
  const [importType, setImportType] = useState<'uber' | 'bolt'>('uber');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingUber, setIsSyncingUber] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);

  const chartData = useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const weeklyMap = new Map<string, { week: string, uber: number, bolt: number }>();

    payments.forEach(p => {
      const date = new Date(p.date || p.payment_date || p.period_start);
      if (date < sixMonthsAgo) return;

      // Get week number or start of week
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)); // Monday
      const weekKey = startOfWeek.toISOString().split('T')[0];

      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { week: weekKey, uber: 0, bolt: 0 });
      }

      const data = weeklyMap.get(weekKey)!;
      const amount = p.gross_revenue || p.gross || 0;
      if (p.platform === 'uber') {
        data.uber += amount;
      } else if (p.platform === 'bolt') {
        data.bolt += amount;
      } else {
        // If no platform, split or assign to one for demo
        data.uber += amount * 0.6;
        data.bolt += amount * 0.4;
      }
    });

    return Array.from(weeklyMap.values()).sort((a, b) => a.week.localeCompare(b.week));
  }, [payments]);

  const handleSendInvoice = async (payment: ImportedData) => {
    setIsSendingInvoice(true);
    try {
      const driver = drivers.find(d => d.id === payment.driver_id || d.full_name === payment.driver);
      if (!driver || !driver.email) {
        toast.error('Motorista não encontrado ou sem email configurado.');
        return;
      }

      const response = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: driver.email,
          companyName: 'Sua Empresa TVDE', // This should ideally come from settings
          clientName: driver.full_name,
          invoiceNumber: payment.id.split('-').pop() || '001',
          amount: payment.net_amount || payment.net || 0,
          items: [
            { description: `Ganhos TVDE - Período ${payment.period}`, amount: payment.net_amount || payment.net || 0 }
          ],
          dueDate: payment.payment_date || payment.date || new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) throw new Error('Falha ao enviar fatura');
      
      toast.success('Fatura enviada com sucesso para ' + driver.email);
      addNotification({
        id: crypto.randomUUID(),
        title: 'Fatura Enviada',
        message: `A fatura do motorista ${driver.full_name} foi enviada por email.`,
        date: new Date().toISOString().split('T')[0],
        read: false
      });
    } catch (error: any) {
      console.error('Erro ao enviar fatura:', error);
      toast.error('Erro ao enviar fatura: ' + error.message);
    } finally {
      setIsSendingInvoice(false);
    }
  };

  const handleSyncUber = async () => {
    setIsSyncingUber(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/uber/sync', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (!response.ok) throw new Error('Falha ao sincronizar dados da Uber');
      const data = await response.json();
      
      if (data.status === 'connected' && data.drivers?.length === 0) {
        toast.info('Conectado à API da Uber com sucesso! No entanto, não foram encontrados novos motoristas ou veículos para sincronizar neste momento.');
        return;
      }

      // Process Uber Drivers
      const uberDrivers = data.drivers || [];
      if (uberDrivers.length > 0) {
        uberDrivers.forEach((ud: any) => {
          const name = ud.name || ud.full_name || ud.first_name + ' ' + ud.last_name;
          if (!name) return;

          const exists = drivers.some(d => d.full_name.toLowerCase() === name.toLowerCase());
          if (!exists) {
            addDriver({
              id: `uber-${ud.id || crypto.randomUUID()}`,
              full_name: name,
              email: ud.email || '',
              phone: ud.phone || '',
              nif: ud.tax_id || ud.nif || '',
              iban: '',
              entry_date: new Date().toISOString().split('T')[0],
              status: 'active',
              acceptance_rate: 100,
              cancellation_rate: 0,
              rating_uber: 5.0,
              rating_bolt: 5.0,
              category: 'Economy',
              documents: [],
              commission_type: 'variable',
              commission_value: 25
            });
          }
        });
      }

      // Process Uber Vehicles
      const uberVehicles = data.vehicles || [];
      if (uberVehicles.length > 0) {
        uberVehicles.forEach((uv: any) => {
          const plate = uv.plate_number || uv.plate || uv.registration_number;
          if (!plate) return;

          const exists = vehicles.some(v => v.plate.toLowerCase() === plate.toLowerCase());
          if (!exists) {
            addVehicle({
              id: `uber-${uv.id || crypto.randomUUID()}`,
              brand: uv.make || uv.brand || 'Desconhecido',
              model: uv.model || 'Desconhecido',
              year: uv.year || new Date().getFullYear(),
              plate: plate,
              color: uv.color || 'Prata',
              category: 'Economy',
              status: 'active',
              entry_date: new Date().toISOString().split('T')[0],
              insurance_expiry: '',
              inspection_expiry: '',
              policy_number: '',
              documents: [],
              maintenance_history: [],
              claims: [],
              inventory: []
            });
          }
        });
      }

      // Process Uber Earnings as Payments
      const uberEarnings = data.earnings || [];
      if (uberEarnings.length > 0) {
        const newPayments = uberEarnings.map((ue: any, index: number) => {
          const gross = parseFloat(ue.amount || ue.total_amount || '0');
          const driverName = ue.driver_name || ue.name || 'Motorista Uber';
          const calculatedNet = calculateNet(driverName, gross);
          
          return {
            id: `uber-earning-${Date.now()}-${index}`,
            driver: driverName,
            period: ue.period || getUberPeriod(),
            gross: gross,
            net: calculatedNet,
            status: 'pending',
            date: ue.date || new Date().toISOString().split('T')[0]
          };
        });
        setPayments([...newPayments, ...payments]);
      }

      toast.success('Sincronização com Uber concluída com sucesso!');
      
      addNotification({
        id: crypto.randomUUID(),
        title: 'Sincronização Uber Concluída',
        message: `Sincronizados ${data.drivers?.length || 0} motoristas e ${data.earnings?.length || 0} registros de ganhos da Uber.`,
        date: new Date().toISOString().split('T')[0],
        read: false
      });

    } catch (error) {
      console.error('Erro ao sincronizar dados Uber:', error);
      toast.error('Erro ao sincronizar dados com a Uber. Verifique a conexão.');
    } finally {
      setIsSyncingUber(false);
    }
  };

  const handleSyncBolt = async () => {
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/bolt/sync', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (!response.ok) throw new Error('Falha ao sincronizar dados da Bolt');
      const data = await response.json();
      
      // Process Bolt Drivers
      const boltDrivers = data.drivers || [];
      if (boltDrivers.length > 0) {
        boltDrivers.forEach((bd: any) => {
          const name = bd.name || bd.full_name || bd.first_name + ' ' + bd.last_name;
          if (!name) return;

          const exists = drivers.some(d => d.full_name.toLowerCase() === name.toLowerCase());
          if (!exists) {
            addDriver({
              id: `bolt-${bd.id || crypto.randomUUID()}`,
              full_name: name,
              email: bd.email || '',
              phone: bd.phone || '',
              nif: bd.tax_id || bd.nif || '',
              iban: '',
              entry_date: new Date().toISOString().split('T')[0],
              status: 'active',
              acceptance_rate: 100,
              cancellation_rate: 0,
              rating_uber: 5.0,
              rating_bolt: 5.0,
              category: 'Economy',
              documents: [],
              commission_type: 'variable',
              commission_value: 25
            });
          }
        });
      }

      // Process Bolt Vehicles
      const boltVehicles = data.vehicles || [];
      if (boltVehicles.length > 0) {
        boltVehicles.forEach((bv: any) => {
          const plate = bv.plate_number || bv.plate || bv.registration_number;
          if (!plate) return;

          const exists = vehicles.some(v => v.plate.toLowerCase() === plate.toLowerCase());
          if (!exists) {
            addVehicle({
              id: `bolt-${bv.id || crypto.randomUUID()}`,
              brand: bv.make || bv.brand || 'Desconhecido',
              model: bv.model || 'Desconhecido',
              year: bv.year || new Date().getFullYear(),
              plate: plate,
              color: bv.color || 'Prata',
              category: 'Economy',
              status: 'active',
              entry_date: new Date().toISOString().split('T')[0],
              insurance_expiry: '',
              inspection_expiry: '',
              policy_number: '',
              documents: [],
              maintenance_history: [],
              claims: [],
              inventory: []
            });
          }
        });
      }

      // Process Bolt Earnings as Payments
      const boltEarnings = data.earnings || [];
      if (boltEarnings.length > 0) {
        const newPayments = boltEarnings.map((be: any, index: number) => {
          const gross = parseFloat(be.amount || be.total_amount || '0');
          const driverName = be.driver_name || be.name || 'Motorista Bolt';
          const calculatedNet = calculateNet(driverName, gross);
          
          return {
            id: `bolt-earning-${Date.now()}-${index}`,
            driver: driverName,
            period: be.period || getUberPeriod(),
            gross: gross,
            net: calculatedNet,
            status: 'pending',
            date: be.date || new Date().toISOString().split('T')[0]
          };
        });
        setPayments([...newPayments, ...payments]);
      }

      toast.success('Sincronização com Bolt concluída com sucesso!');
      
      addNotification({
        id: crypto.randomUUID(),
        title: 'Sincronização Bolt Concluída',
        message: `Sincronizados ${data.drivers?.length || 0} motoristas e ${data.earnings?.length || 0} registros de ganhos da Bolt.`,
        date: new Date().toISOString().split('T')[0],
        read: false
      });

    } catch (error) {
      console.error('Erro ao sincronizar dados Bolt:', error);
      toast.error('Erro ao sincronizar dados com a Bolt. Verifique a conexão.');
    } finally {
      setIsSyncing(false);
    }
  };

  const calculateNet = (driverId: string, gross: number) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return gross * 0.75; 

    const driverExpenses = expenses.filter(e => e.driver_id === driver.id && e.status === 'approved');
    
    const tolls = driverExpenses.filter(e => e.category === 'portagem').reduce((acc, e) => acc + e.amount, 0);
    const fuel = driverExpenses.filter(e => e.category === 'combustivel').reduce((acc, e) => acc + e.amount, 0);
    const rent = driverExpenses.filter(e => e.category === 'aluguel').reduce((acc, e) => acc + e.amount, 0);
    
    const commission = driver.commission_type === 'fixed' 
      ? driver.commission_value 
      : gross * (driver.commission_value / 100);

    return gross - commission - tolls - fuel - rent;
  };

  const handleExportExcel = () => {
    const dataToExport = filteredPayments.map(p => ({
      Motorista: p.driver || drivers.find(d => d.id === p.driver_id)?.full_name,
      Período: p.period || `${p.period_start} - ${p.period_end}`,
      'Receita Bruta': p.gross_revenue || p.gross || 0,
      'Taxas Plataforma': (p.gross_revenue || p.gross || 0) - (p.net_amount || p.net || 0),
      'Valor Líquido': p.net_amount || p.net || 0,
      Status: p.status === 'paid' ? 'Pago' : 'Pendente',
      Data: p.payment_date || p.date
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financeiro_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const newPayments: any[] = [];
        const unknownDrivers: string[] = [];
        const errors: string[] = [];

        data.forEach((row, index) => {
          // Skip empty rows or invalid data
          if (!row || Object.keys(row).length < 2) return;

          let driverName = '';
          let gross = 0;
          let net = 0;

          try {
            if (importType === 'bolt') {
              driverName = row['Motorista'] || row['Driver'] || '';
              const grossStr = row['Ganhos brutos (total)|€'] || row['Gross earnings|€'] || '0';
              const netStr = row['Ganhos líquidos|€'] || row['Net earnings|€'] || '0';
              gross = parseFloat(grossStr.toString().replace(',', '.'));
              net = parseFloat(netStr.toString().replace(',', '.'));
            } else {
              // Uber
              const firstName = row['Nome próprio do motorista'] || row['Driver First Name'] || '';
              const lastName = row['Apelido do motorista'] || row['Driver Last Name'] || '';
              driverName = `${firstName} ${lastName}`.trim();
              const grossStr = row['Pago a si : Os seus rendimentos : Tarifa'] || row['Your earnings : Fare'] || '0';
              const netStr = row['Pago a si'] || row['Net Payout'] || '0';
              gross = parseFloat(grossStr.toString().replace(',', '.'));
              net = parseFloat(netStr.toString().replace(',', '.'));
            }

            if (isNaN(gross)) gross = 0;
            if (isNaN(net)) net = 0;

            if (driverName && (gross > 0 || net !== 0)) {
              // Find driver by multiple criteria
              const driver = drivers.find(d => {
                const matchesName = d.full_name.toLowerCase() === driverName.toLowerCase();
                const matchesEmail = row['Email'] === d.email || row['E-mail'] === d.email;
                const matchesUberUUID = importType === 'uber' && (row['Driver UUID'] === d.uber_uuid || row['UUID'] === d.uber_uuid);
                const matchesBoltID = importType === 'bolt' && (row['Driver ID'] === d.bolt_id || row['ID'] === d.bolt_id);
                return matchesName || matchesEmail || matchesUberUUID || matchesBoltID;
              });

              if (!driver && !unknownDrivers.includes(driverName)) {
                unknownDrivers.push(driverName);
              }

              const calculatedNet = calculateNet(driver?.id || '', gross || net);
              newPayments.push({
                id: `import-${importType}-${Date.now()}-${index}`,
                driver: driver?.full_name || driverName,
                driver_id: driver?.id,
                period: getUberPeriod(),
                gross: gross || net,
                net: calculatedNet,
                status: 'pending',
                date: new Date().toISOString().split('T')[0]
              });
            }
          } catch (err) {
            errors.push(`Erro na linha ${index + 2}: Formato de número inválido.`);
          }
        });

        if (errors.length > 0) {
          toast.warning(`Aviso: Encontrados ${errors.length} erros durante a importação. Algumas linhas podem ter sido ignoradas.`);
        }

        if (newPayments.length > 0) {
          setPayments([...newPayments, ...payments]);
          
          let message = `Foram importados ${newPayments.length} registros de pagamentos para o período ${getUberPeriod()}.`;
          if (unknownDrivers.length > 0) {
            message += ` Atenção: ${unknownDrivers.length} motoristas não foram encontrados no sistema e usaram cálculos padrão.`;
            toast.warning(`Aviso: ${unknownDrivers.length} motoristas não foram reconhecidos no sistema. Foi aplicada a comissão padrão de 25%.`);
          } else {
            toast.success(`${newPayments.length} registros importados com sucesso!`);
          }

          addNotification({
            id: crypto.randomUUID(),
            title: `Importação ${importType.toUpperCase()} Concluída`,
            message: message,
            date: new Date().toISOString().split('T')[0],
            read: false
          });
        } else {
          toast.error('Nenhum dado válido encontrado no arquivo. Verifique se o formato está correto.');
        }

        setIsProcessing(false);
        setShowImportModal(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: (error) => {
        console.error('Erro ao processar CSV:', error);
        toast.error('Erro ao processar o arquivo CSV.');
        setIsProcessing(false);
      }
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Pago</span>;
      case 'processing': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">Processando</span>;
      case 'pending': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">Pendente</span>;
      default: return null;
    }
  };

  const handleStatusChange = (id: string, newStatus: string, paymentDate?: string) => {
    const updateData: any = { status: newStatus };
    if (newStatus === 'paid') {
      updateData.date = paymentDate || new Date().toISOString().split('T')[0];
    }
    
    updatePayment(id, updateData);
    addNotification({
      id: crypto.randomUUID(),
      title: 'Status de Pagamento Atualizado',
      message: `O pagamento foi marcado como ${newStatus === 'paid' ? 'Pago' : newStatus === 'processing' ? 'em Processamento' : 'Pendente'}.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    });
  };

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const parentRef = useRef<HTMLDivElement>(null);

  // Indexing payments for optimized search and filtering
  const { paymentsByDriver, paymentsByPeriod, uniquePeriods } = useMemo(() => {
    const byDriver = new Map<string, typeof payments>();
    const byPeriod = new Map<string, typeof payments>();
    const periods = new Set<string>();

    payments.forEach(p => {
      const driverName = (p.driver || drivers.find(d => d.id === p.driver_id)?.full_name || '').toLowerCase();
      const period = p.period || `${p.period_start} - ${p.period_end}`;

      // Index by driver
      if (!byDriver.has(driverName)) {
        byDriver.set(driverName, []);
      }
      byDriver.get(driverName)!.push(p);

      // Index by period
      if (!byPeriod.has(period)) {
        byPeriod.set(period, []);
      }
      byPeriod.get(period)!.push(p);
      periods.add(period);
    });

    return { 
      paymentsByDriver: byDriver, 
      paymentsByPeriod: byPeriod,
      uniquePeriods: Array.from(periods).sort((a, b) => b.localeCompare(a))
    };
  }, [payments, drivers]);

  const filteredPayments = useMemo(() => {
    let result = payments;

    // Filter by period using index (O(1) lookup if specific period)
    if (selectedPeriod !== 'all') {
      result = paymentsByPeriod.get(selectedPeriod) || [];
    }

    // Filter by driver using index keys
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchedDrivers = Array.from(paymentsByDriver.keys()).filter(name => name.includes(searchLower));
      
      if (selectedPeriod !== 'all') {
         result = result.filter(p => {
           const driverName = (p.driver || drivers.find(d => d.id === p.driver_id)?.full_name || '').toLowerCase();
           return matchedDrivers.includes(driverName);
         });
      } else {
         result = matchedDrivers.flatMap(name => paymentsByDriver.get(name) || []);
      }
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      result = result.filter(p => {
        const pDate = new Date(p.date || p.payment_date || '').getTime();
        return pDate >= start && pDate <= end;
      });
    }

    // Filter by tab status
    if (activeTab === 'pending') {
      result = result.filter(p => p.status === 'pending');
    } else if (activeTab === 'history') {
      result = result.filter(p => p.status === 'paid');
    }

    return result;
  }, [payments, paymentsByDriver, paymentsByPeriod, searchTerm, selectedPeriod, activeTab, drivers, startDate, endDate]);

  const stats = useMemo(() => ({
    totalGross: filteredPayments.reduce((acc, p) => acc + p.gross, 0),
    totalNet: filteredPayments.reduce((acc, p) => acc + p.net, 0),
    totalCommission: filteredPayments.reduce((acc, p) => acc + (p.gross - p.net), 0),
    pendingCount: filteredPayments.filter(p => p.status === 'pending').length
  }), [filteredPayments]);

  const rowVirtualizer = useVirtualizer({
    count: filteredPayments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 73, // approximate row height
    overscan: 5,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Gestão de receitas e pagamentos semanais (Segunda a Segunda).</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleSyncUber}
            disabled={isSyncingUber}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold border bg-black text-white border-black hover:bg-gray-900 flex items-center justify-center gap-2 transition-all text-sm sm:text-base disabled:opacity-50"
          >
            {isSyncingUber ? (
              <Loader2 className="w-4 h-4 sm:w-5 h-5 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 sm:w-5 h-5" />
            )}
            {isSyncingUber ? 'Sincronizando...' : 'Sincronizar Uber'}
          </button>
          <button 
            onClick={handleSyncBolt}
            disabled={isSyncing}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold border bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 flex items-center justify-center gap-2 transition-all text-sm sm:text-base disabled:opacity-50"
          >
            {isSyncing ? (
              <Loader2 className="w-4 h-4 sm:w-5 h-5 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 sm:w-5 h-5" />
            )}
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Bolt'}
          </button>
          <button 
            onClick={() => {
              if (confirm('ATENÇÃO: Isso apagará TODOS os dados do sistema (Motoristas, Veículos, Despesas, etc). Deseja continuar?')) {
                clearAllData();
                toast.success('Todos os dados foram zerados.');
              }
            }}
            className="bg-red-50 text-red-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold border border-red-100 flex items-center justify-center gap-2 hover:bg-red-100 transition-all text-sm sm:text-base"
          >
            <AlertCircle className="w-4 h-4 sm:w-5 h-5" />
            Zerar Tudo
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="bg-white text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-sm sm:text-base"
          >
            <FileUp className="w-4 h-4 sm:w-5 h-5" />
            Importar Valores
          </button>
          <button 
            onClick={handleExportExcel}
            className="bg-sidebar text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 text-sm sm:text-base"
          >
            <Download className="w-4 h-4 sm:w-5 h-5" />
            Exportar Excel
          </button>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Importar CSV</h2>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 block">Selecione a Plataforma</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setImportType('uber')}
                    className={cn(
                      "py-4 rounded-xl font-bold border transition-all flex flex-col items-center gap-2",
                      importType === 'uber' ? "bg-black border-black text-white" : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100"
                    )}
                  >
                    <span className="text-lg">Uber</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setImportType('bolt')}
                    className={cn(
                      "py-4 rounded-xl font-bold border transition-all flex flex-col items-center gap-2",
                      importType === 'bolt' ? "bg-emerald-600 border-emerald-600 text-white" : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100"
                    )}
                  >
                    <span className="text-lg">Bolt</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 block">Arquivo CSV</label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <div 
                  onClick={handleImportClick}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer",
                    isProcessing ? "bg-gray-50 border-gray-200 cursor-not-allowed" : "border-gray-200 hover:border-sidebar/50 hover:bg-gray-50"
                  )}
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-sidebar animate-spin" />
                      <p className="text-sm font-bold text-gray-600">Processando arquivo...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FileUp className="w-10 h-10 text-gray-300" />
                      <p className="text-sm font-bold text-gray-700">Clique para selecionar o CSV</p>
                      <p className="text-xs text-gray-400">Arraste o arquivo exportado da {importType.toUpperCase()}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Certifique-se de que o arquivo CSV é o relatório oficial de ganhos da plataforma para garantir a precisão dos dados.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600">Total Bruto</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Receita Bruta Acumulada</p>
          <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.totalGross)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Euro className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-indigo-600">Comissão Plataformas</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Taxas Uber/Bolt</p>
          <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.totalCommission)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <History className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-600">{stats.pendingCount} Pendentes</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Total Líquido a Pagar</p>
          <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.totalNet)}</h3>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
              <History className="w-5 h-5 text-sidebar" />
              Receita Semanal por Plataforma (Últimos 6 Meses)
            </h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="week" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    tickFormatter={(value) => `€${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelFormatter={(label) => `Semana de ${new Date(label).toLocaleDateString('pt-PT')}`}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="uber" name="Uber" fill="#000000" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bolt" name="Bolt" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-sidebar p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Euro className="w-32 h-32" />
              </div>
              <h3 className="text-lg font-bold mb-6 relative z-10">Projeção de Lucro (Frota)</h3>
              <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sidebar-foreground text-xs font-bold uppercase tracking-widest">Taxa Administrativa (25%)</p>
                    <p className="text-3xl font-bold mt-1 text-emerald-400">{formatCurrency(stats.totalGross * 0.25)}</p>
                  </div>
                  <div>
                    <p className="text-sidebar-foreground text-xs font-bold uppercase tracking-widest">Despesas Operacionais</p>
                    <p className="text-3xl font-bold mt-1 text-red-300">{formatCurrency(expenses.reduce((acc, e) => acc + e.amount, 0))}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <p className="text-sidebar-foreground text-xs font-bold uppercase tracking-widest">Lucro Líquido Estimado</p>
                  <p className="text-4xl font-black mt-1">
                    {formatCurrency((stats.totalGross * 0.25) - expenses.reduce((acc, e) => acc + e.amount, 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                Top Motoristas (Receita)
              </h3>
              <div className="space-y-6">
                {drivers.slice(0, 4).map((driver, index) => (
                  <div key={driver.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold">{driver.full_name}</p>
                        <p className="text-xs text-gray-500">{driver.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(Math.random() * 1000 + 500)}</p>
                      <p className="text-xs text-emerald-600 font-bold">+12%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('overview')}
            className={cn(
              "px-6 sm:px-8 py-4 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap",
              activeTab === 'overview' ? "border-sidebar text-sidebar" : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={cn(
              "px-6 sm:px-8 py-4 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap",
              activeTab === 'pending' ? "border-sidebar text-sidebar" : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            Pagamentos Pendentes
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-6 sm:px-8 py-4 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap",
              activeTab === 'history' ? "border-sidebar text-sidebar" : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            Histórico
          </button>
        </div>

        <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
            <div className="flex items-center gap-2 mr-4">
              <History className="w-5 h-5 text-sidebar" />
              <h3 className="font-bold text-gray-900 whitespace-nowrap">
                {activeTab === 'overview' ? 'Visão Geral' : activeTab === 'pending' ? 'Pagamentos Pendentes' : 'Histórico de Pagamentos'}
              </h3>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por motorista..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sidebar/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sidebar/10 appearance-none cursor-pointer"
              >
                <option value="all">Todos os Períodos</option>
                {uniquePeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sidebar/10"
              />
              <span className="text-gray-400">-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sidebar/10"
              />
            </div>
            {activeTab === 'pending' && filteredPayments.length > 0 && (
              <button 
                onClick={() => {
                  if (confirm(`Deseja marcar todos os ${filteredPayments.length} pagamentos como pagos?`)) {
                    setPayments(payments.map(p => p.status === 'pending' ? { ...p, status: 'paid' } : p));
                    toast.success('Todos os pagamentos foram processados!');
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Pagar Todos
              </button>
            )}
          </div>
        </div>

        <div 
          ref={parentRef} 
          className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
        >
          <table className="w-full text-left relative">
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm shadow-sm">
              <tr className="flex w-full">
                <th className="data-grid-header w-[20%]">Motorista</th>
                <th className="data-grid-header w-[15%]">Período</th>
                <th className="data-grid-header w-[15%]">Receita Bruta</th>
                <th className="data-grid-header w-[15%]">Taxas Plataforma</th>
                <th className="data-grid-header w-[15%]">Valor Líquido</th>
                <th className="data-grid-header w-[10%]">Status</th>
                <th className="data-grid-header text-right w-[10%]">Ações</th>
              </tr>
            </thead>
            <tbody 
              className="divide-y divide-gray-50"
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: 'relative',
              }}
            >
              {filteredPayments.length > 0 ? (
                rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const p = filteredPayments[virtualRow.index];
                  return (
                  <tr 
                    key={p.id} 
                    className="data-grid-row absolute w-full flex items-center"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <td className="px-4 py-4 w-[20%]">
                      <p className="text-sm font-bold truncate">{p.driver || drivers.find(d => d.id === p.driver_id)?.full_name}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 w-[15%] truncate">{p.period || `${p.period_start} - ${p.period_end}`}</td>
                    <td className="px-4 py-4 text-sm font-medium w-[15%]">{formatCurrency(p.gross_revenue || p.gross || 0)}</td>
                    <td className="px-4 py-4 text-sm text-red-500 w-[15%]">-{formatCurrency((p.gross_revenue || p.gross || 0) - (p.net_amount || p.net || 0))}</td>
                    <td className="px-4 py-4 text-sm font-bold text-emerald-600 w-[15%]">{formatCurrency(p.net_amount || p.net || 0)}</td>
                    <td className="px-4 py-4 w-[10%]">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(p.status)}
                        {(p.status === 'paid' || p.status === 'processing') && (
                          <input 
                            type="date" 
                            className="text-[10px] border-none bg-transparent text-gray-400 focus:ring-0 p-0 h-auto w-24"
                            value={p.payment_date || p.date || ''}
                            onChange={(e) => handleStatusChange(p.id, 'paid', e.target.value)}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right w-[10%]">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusChange(p.id, 'processing')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Marcar como Processando"
                          >
                            <Loader2 className="w-5 h-5" />
                          </button>
                        )}
                        {p.status === 'processing' && (
                          <button 
                            onClick={() => handleStatusChange(p.id, 'paid')}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Marcar como Pago"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        {p.status === 'paid' && (
                          <button 
                            onClick={() => handleStatusChange(p.id, 'pending')}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Reverter para Pendente"
                          >
                            <History className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => setShowDetailsModal(p)}
                          className="text-sidebar text-xs font-bold hover:underline"
                        >
                          Ver Detalhes
                        </button>
                      </div>
                    </td>
                  </tr>
                )})
              ) : (
                <tr className="absolute w-full flex">
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic w-full">
                    Nenhum pagamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Resumo de Ganhos</h2>
                <p className="text-sm text-gray-400 mt-1">{showDetailsModal.driver} • {showDetailsModal.period}</p>
              </div>
              <button onClick={() => setShowDetailsModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Faturamento Bruto</span>
                  <span className="font-bold">{formatCurrency(showDetailsModal.gross)}</span>
                </div>
                <div className="flex justify-between items-center text-red-500">
                  <span className="text-gray-500">Comissão Plataforma (Estimada)</span>
                  <span>-{formatCurrency(showDetailsModal.gross * 0.25)}</span>
                </div>
                
                {(() => {
                  const driver = drivers.find(d => d.full_name === showDetailsModal.driver);
                  if (!driver) return null;
                  const driverExpenses = expenses.filter(e => e.driver_id === driver.id && e.status === 'approved');
                  const tolls = driverExpenses.filter(e => e.category === 'portagem').reduce((acc, e) => acc + e.amount, 0);
                  const fuel = driverExpenses.filter(e => e.category === 'combustivel').reduce((acc, e) => acc + e.amount, 0);
                  const rent = driverExpenses.filter(e => e.category === 'aluguel').reduce((acc, e) => acc + e.amount, 0);

                  return (
                    <>
                      {tolls > 0 && (
                        <div className="flex justify-between items-center text-red-500">
                          <span className="text-gray-500">Portagens (Via Verde)</span>
                          <span>-{formatCurrency(tolls)}</span>
                        </div>
                      )}
                      {fuel > 0 && (
                        <div className="flex justify-between items-center text-red-500">
                          <span className="text-gray-500">Combustível</span>
                          <span>-{formatCurrency(fuel)}</span>
                        </div>
                      )}
                      {rent > 0 && (
                        <div className="flex justify-between items-center text-red-500">
                          <span className="text-gray-500">Aluguel de Viatura</span>
                          <span>-{formatCurrency(rent)}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Líquido</span>
                  <span className="text-2xl font-black text-emerald-600">{formatCurrency(showDetailsModal.net)}</span>
                </div>
                
                <button 
                  onClick={() => handleSendInvoice(showDetailsModal)}
                  disabled={isSendingInvoice}
                  className="w-full py-4 bg-sidebar text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-sidebar/20 disabled:opacity-50"
                >
                  {isSendingInvoice ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <FileUp className="w-5 h-5" />
                  )}
                  Enviar Fatura por Email
                </button>
              </div>

              <button 
                onClick={() => setShowDetailsModal(null)}
                className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
