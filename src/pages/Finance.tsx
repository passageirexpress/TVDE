import React, { useState, useRef, useEffect } from 'react';
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
  Zap
} from 'lucide-react';
import Papa from 'papaparse';
import { formatCurrency, cn, getUberPeriod } from '../lib/utils';
import { useDataStore } from '../store/useDataStore';

interface ImportedData {
  id: string;
  driver: string;
  platform: 'uber' | 'bolt';
  gross: number;
  net: number;
  commission: number;
  period: string;
  status: 'pending' | 'paid';
}

const initialPayments = [
  { id: '1', driver: 'João Silva', period: '16/02 - 23/02', gross: 600, net: 450, status: 'paid', date: '2026-02-23' },
  { id: '2', driver: 'Maria Santos', period: '16/02 - 23/02', gross: 750, net: 562.5, status: 'paid', date: '2026-02-23' },
  { id: '3', driver: 'Ana Oliveira', period: '23/02 - 02/03', gross: 400, net: 300, status: 'pending', date: '2026-03-02' },
  { id: '4', driver: 'Pedro Costa', period: '23/02 - 02/03', gross: 225, net: 168.75, status: 'pending', date: '2026-03-02' },
];

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

  const handleSyncBolt = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/bolt/sync');
      if (!response.ok) throw new Error('Falha ao sincronizar dados da Bolt');
      const data = await response.json();
      
      console.log('Bolt Sync Data Received:', data);

      // Process Bolt Drivers
      const boltDrivers = data.drivers || [];
      if (boltDrivers.length > 0) {
        boltDrivers.forEach((bd: any) => {
          const name = bd.name || bd.full_name || bd.first_name + ' ' + bd.last_name;
          if (!name) return;

          const exists = drivers.some(d => d.full_name.toLowerCase() === name.toLowerCase());
          if (!exists) {
            addDriver({
              id: `bolt-${bd.id || Math.random()}`,
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
              id: `bolt-${bv.id || Math.random()}`,
              brand: bv.make || bv.brand || 'Desconhecido',
              model: bv.model || 'Desconhecido',
              year: bv.year || new Date().getFullYear(),
              plate: plate,
              category: 'Economy',
              status: 'active',
              entry_date: new Date().toISOString().split('T')[0],
              insurance_expiry: '',
              inspection_expiry: '',
              policy_number: '',
              documents: []
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

      alert(data.isMock ? 'Sincronização concluída (Modo de Demonstração).' : 'Sincronização com Bolt concluída com sucesso!');
      
      addNotification({
        id: Math.random().toString(36).substr(2, 9),
        title: data.isMock ? 'Sincronização (Modo Demo)' : 'Sincronização Bolt Concluída',
        message: data.isMock 
          ? 'As credenciais da Bolt não foram configuradas. Foram carregados dados de demonstração.'
          : `Sincronizados ${data.drivers?.length || 0} motoristas e ${data.earnings?.length || 0} registros de ganhos.`,
        date: new Date().toISOString().split('T')[0],
        read: false
      });

    } catch (error) {
      console.error('Erro ao sincronizar dados Bolt:', error);
      alert('Erro ao sincronizar dados com a Bolt. Verifique a conexão.');
    } finally {
      setIsSyncing(false);
    }
  };

  const calculateNet = (driverName: string, gross: number) => {
    const driver = drivers.find(d => d.full_name.toLowerCase() === driverName.toLowerCase());
    if (!driver) return gross * 0.75; // Default 25% commission if driver not found

    // Find all approved expenses for this driver
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
      Motorista: p.driver,
      Período: p.period,
      'Receita Bruta': p.gross,
      'Taxas Plataforma': p.gross - p.net,
      'Valor Líquido': p.net,
      Status: p.status === 'paid' ? 'Pago' : 'Pendente',
      Data: p.date
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

        data.forEach((row, index) => {
          let driverName = '';
          let gross = 0;
          let net = 0;

          if (importType === 'bolt') {
            driverName = row['Motorista'] || row['Driver'] || '';
            gross = parseFloat(row['Ganhos brutos (total)|€']?.replace(',', '.') || row['Gross earnings|€']?.replace(',', '.') || '0');
            net = parseFloat(row['Ganhos líquidos|€']?.replace(',', '.') || row['Net earnings|€']?.replace(',', '.') || '0');
          } else {
            // Uber
            const firstName = row['Nome próprio do motorista'] || row['Driver First Name'] || '';
            const lastName = row['Apelido do motorista'] || row['Driver Last Name'] || '';
            driverName = `${firstName} ${lastName}`.trim();
            gross = parseFloat(row['Pago a si : Os seus rendimentos : Tarifa']?.replace(',', '.') || row['Your earnings : Fare']?.replace(',', '.') || '0');
            net = parseFloat(row['Pago a si']?.replace(',', '.') || row['Net Payout']?.replace(',', '.') || '0');
          }

          if (driverName && (gross > 0 || net !== 0)) {
            const driverExists = drivers.some(d => d.full_name.toLowerCase() === driverName.toLowerCase());
            if (!driverExists && !unknownDrivers.includes(driverName)) {
              unknownDrivers.push(driverName);
            }

            const calculatedNet = calculateNet(driverName, gross || net);
            newPayments.push({
              id: `import-${importType}-${Date.now()}-${index}`,
              driver: driverName,
              period: getUberPeriod(),
              gross: gross || net,
              net: calculatedNet,
              status: 'pending',
              date: new Date().toISOString().split('T')[0]
            });
          }
        });

        if (newPayments.length > 0) {
          setPayments([...newPayments, ...payments]);
          
          let message = `Foram importados ${newPayments.length} registros de pagamentos para o período ${getUberPeriod()}.`;
          if (unknownDrivers.length > 0) {
            message += ` Atenção: ${unknownDrivers.length} motoristas não foram encontrados no sistema e usaram cálculos padrão.`;
            alert(`Aviso: Motorista não encontrado no sistema.\n\nOs seguintes motoristas não foram reconhecidos: ${unknownDrivers.join(', ')}.\n\nSerá aplicada a comissão padrão de 25%.`);
          } else {
            alert(`${newPayments.length} registros importados com sucesso!`);
          }

          addNotification({
            id: Math.random().toString(36).substr(2, 9),
            title: `Importação ${importType.toUpperCase()} Concluída`,
            message: message,
            date: new Date().toISOString().split('T')[0],
            read: false
          });
        } else {
          alert('Nenhum dado válido encontrado no arquivo. Verifique se o formato está correto.');
        }

        setIsProcessing(false);
        setShowImportModal(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: (error) => {
        console.error('Erro ao processar CSV:', error);
        alert('Erro ao processar o arquivo CSV.');
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

  const handleStatusChange = (id: string, newStatus: string) => {
    updatePayment(id, { status: newStatus });
    addNotification({
      id: Math.random().toString(36).substr(2, 9),
      title: 'Status de Pagamento Atualizado',
      message: `O pagamento foi marcado como ${newStatus === 'paid' ? 'Pago' : newStatus === 'processing' ? 'em Processamento' : 'Pendente'}.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    });
  };

  const stats = {
    totalGross: payments.reduce((acc, p) => acc + p.gross, 0),
    totalNet: payments.reduce((acc, p) => acc + p.net, 0),
    totalCommission: payments.reduce((acc, p) => acc + (p.gross - p.net), 0),
    pendingCount: payments.filter(p => p.status === 'pending').length
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.driver.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'pending') return matchesSearch && p.status === 'pending';
    if (activeTab === 'history') return matchesSearch && p.status === 'paid';
    return matchesSearch;
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
            onClick={handleSyncBolt}
            disabled={isSyncing}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold border bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 flex items-center justify-center gap-2 transition-all text-sm sm:text-base disabled:opacity-50"
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
                alert('Todos os dados foram zerados.');
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
            <button 
              onClick={() => alert('Filtro de período em breve...')}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Período
            </button>
            {activeTab === 'pending' && filteredPayments.length > 0 && (
              <button 
                onClick={() => {
                  if (confirm(`Deseja marcar todos os ${filteredPayments.length} pagamentos como pagos?`)) {
                    setPayments(payments.map(p => p.status === 'pending' ? { ...p, status: 'paid' } : p));
                    alert('Todos os pagamentos foram processados!');
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

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="data-grid-header">Motorista</th>
                <th className="data-grid-header">Período</th>
                <th className="data-grid-header">Receita Bruta</th>
                <th className="data-grid-header">Taxas Plataforma</th>
                <th className="data-grid-header">Valor Líquido</th>
                <th className="data-grid-header">Status</th>
                <th className="data-grid-header text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="data-grid-row">
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold">{p.driver}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{p.period}</td>
                    <td className="px-4 py-4 text-sm font-medium">{formatCurrency(p.gross)}</td>
                    <td className="px-4 py-4 text-sm text-red-500">-{formatCurrency(p.gross - p.net)}</td>
                    <td className="px-4 py-4 text-sm font-bold text-emerald-600">{formatCurrency(p.net)}</td>
                    <td className="px-4 py-4">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="px-4 py-4 text-right">
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
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                    Motorista não encontrado no sistema.
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

              <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Líquido</span>
                  <span className="text-2xl font-black text-emerald-600">{formatCurrency(showDetailsModal.net)}</span>
                </div>
              </div>

              <button 
                onClick={() => setShowDetailsModal(null)}
                className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all mt-4"
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
