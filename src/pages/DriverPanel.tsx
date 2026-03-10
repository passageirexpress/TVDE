import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  Euro, 
  Calendar, 
  ArrowUpRight, 
  Download, 
  Clock,
  Car,
  ChevronRight,
  Bell,
  Filter,
  Wallet,
  Info,
  FileText,
  Upload,
  Building2,
  CheckCircle2,
  Receipt,
  AlertCircle,
  X,
  PlusCircle,
  MessageSquare,
  ShieldAlert,
  Package,
  MapPin,
  Navigation,
  CheckCircle,
  Play,
  Plane,
  Archive
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { formatCurrency, cn, getUberPeriod } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';

const companyData = {
  name: 'Sua Empresa TVDE',
  nif: '000000000',
  address: 'Endereço da Empresa',
  email: 'seu-email@empresa.pt'
};

const dailyData = [
  { day: 'Seg', uber: 85.50, bolt: 40.20 },
  { day: 'Ter', uber: 92.00, bolt: 35.50 },
  { day: 'Qua', uber: 78.30, bolt: 45.00 },
  { day: 'Qui', uber: 110.00, bolt: 50.40 },
  { day: 'Sex', uber: 125.00, bolt: 65.00 },
  { day: 'Sáb', uber: 140.00, bolt: 80.00 },
  { day: 'Dom', uber: 95.00, bolt: 45.00 },
];

const initialHistory = [
  { id: '1', date: '2026-02-23', period: '16/02 - 23/02', uber: 420.50, bolt: 180.20, commission_uber: 105.13, commission_bolt: 45.05, total: 600.70, net: 450.52, status: 'processing' },
  { id: '2', date: '2026-02-16', period: '09/02 - 16/02', uber: 510.00, bolt: 210.50, commission_uber: 127.50, commission_bolt: 52.63, total: 720.50, net: 540.37, status: 'paid' },
  { id: '3', date: '2026-02-09', period: '02/02 - 09/02', uber: 480.30, bolt: 190.00, commission_uber: 120.08, commission_bolt: 47.50, total: 670.30, net: 502.72, status: 'paid' },
  { id: '4', date: '2026-02-02', period: '26/01 - 02/02', uber: 550.00, bolt: 230.40, commission_uber: 137.50, commission_bolt: 57.60, total: 780.40, net: 585.30, status: 'paid' },
];

const performanceData = [
  { name: 'Taxas', aceitacao: 88, cancelamento: 5 },
];

export default function DriverPanel() {
  const user = useAuthStore(state => state.user);
  const { 
    expenses, vehicles, drivers, payments, syncDriverEarnings, 
    earningImports, transfers, deliveries, updateTransfer, 
    updateDelivery, deliveryPoints 
  } = useDataStore();
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'estafeta'>('dashboard');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'fuel',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const myExpenses = expenses.filter(e => e.driver_id === user?.id && e.status === 'approved');
  const myVehicle = vehicles.find(v => v.current_driver_id === user?.id);
  const myDriverData = drivers.find(d => d.id === user?.id);
  const myPayments = payments.filter(p => p.driver_id === user?.id);
  const myServices = [
    ...transfers.filter(t => t.driver_id === user?.id),
    ...deliveries.filter(d => d.driver_id === user?.id)
  ].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const hasUnprocessedEarnings = earningImports.some(ei => ei.driver_id === user?.id && !ei.processed);

  const expiringDocs = [
    ...(myVehicle ? [
      { name: 'Seguro (Viatura)', date: myVehicle.insurance_expiry },
      { name: 'Inspeção (Viatura)', date: myVehicle.inspection_expiry }
    ] : []),
    ...(myDriverData ? myDriverData.documents.map(doc => ({ name: doc.type, date: doc.expiry_date })) : [])
  ].filter(doc => {
    if (!doc.date) return false;
    const expiry = new Date(doc.date);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  });

  const [vehicleData, setVehicleData] = useState({
    brand: myVehicle?.brand || 'Toyota',
    model: myVehicle?.model || 'Corolla',
    year: myVehicle?.year?.toString() || '2022',
    plate: myVehicle?.plate || 'AA-11-BB',
    category: myVehicle?.category || 'Economy',
    documents: [
      { name: 'Seguro', expiry: myVehicle?.insurance_expiry || '2024-12-31', status: 'valid' },
      { name: 'Inspeção', expiry: myVehicle?.inspection_expiry || '2024-12-31', status: 'valid' },
    ]
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Simulate payment received after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Logic moved to store or handled differently
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleSync = async () => {
    if (!user?.id) return;
    setIsSyncing(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    syncDriverEarnings(user.id);
    setIsSyncing(false);
    setShowNotification(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    const expense = {
      id: crypto.randomUUID(),
      company_id: user.company_id || '1',
      driver_id: user.id,
      category: newExpense.category as any,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: newExpense.date,
      status: 'pending' as const,
      receipt_url: ''
    };

    useDataStore.getState().addExpense(expense);
    setShowExpenseModal(false);
    setNewExpense({
      category: 'fuel',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    toast.success('Despesa enviada para aprovação!');
  };

  const filteredHistory = myPayments.filter(item => {
    if (filter === 'all') return true;
    const itemDate = new Date(item.payment_date || '');
    const now = new Date();
    
    if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return itemDate >= weekAgo;
    }
    if (filter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return itemDate >= monthAgo;
    }
    if (filter === 'custom' && customRange.start && customRange.end) {
      const start = new Date(customRange.start);
      const end = new Date(customRange.end);
      return itemDate >= start && itemDate <= end;
    }
    return true;
  });

  const totalBalance = filteredHistory.reduce((acc, curr) => acc + curr.net_amount, 0);

  const handleUpdateServiceStatus = async (service: any, newStatus: string) => {
    try {
      if ('flight_number' in service) {
        updateTransfer(service.id, { 
          status: newStatus as any,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
        });
      } else {
        updateDelivery(service.id, { 
          status: newStatus as any,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
        });
      }
      toast.success(`Serviço atualizado para: ${newStatus === 'in_progress' ? 'Em Curso' : 'Concluído'}`);
    } catch (error) {
      toast.error('Erro ao atualizar serviço');
    }
  };

  const pendingBalance = filteredHistory.filter(h => h.status !== 'paid').reduce((acc, curr) => acc + curr.net_amount, 0);
  const paidBalance = filteredHistory.filter(h => h.status === 'paid').reduce((acc, curr) => acc + curr.net_amount, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Audio for notification */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      {/* Visual Notification */}
      {showNotification && (
        <div className="fixed top-20 right-8 z-[100] animate-bounce">
          <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-500">
            <div className="bg-white/20 p-2 rounded-full">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Pagamento Recebido!</p>
              <p className="text-xs text-emerald-100">O status da semana 16/02 mudou para Pago.</p>
            </div>
            <button onClick={() => setShowNotification(false)} className="ml-4 text-white/60 hover:text-white">
              <ChevronRight className="w-5 h-5 rotate-90" />
            </button>
          </div>
        </div>
      )}

      {expiringDocs.length > 0 && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-[32px] flex flex-col sm:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-100 text-red-600 rounded-2xl animate-pulse">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-900">Atenção: Documentos Próximos do Vencimento</h3>
              <p className="text-sm text-red-700 mt-1">
                Você tem {expiringDocs.length} documento(s) que vencem em menos de 30 dias. Por favor, atualize-os para evitar bloqueios.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {expiringDocs.map((doc, idx) => (
              <div key={idx} className="bg-white px-4 py-2 rounded-xl border border-red-100 shadow-sm flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700 capitalize">{doc.name}:</span>
                <span className="text-xs font-black text-red-600">{doc.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Painel do Motorista</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Acompanhe seus ganhos diários e histórico de pagamentos.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowExpenseModal(true)}
            className="bg-sidebar text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 text-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Submeter Despesa
          </button>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex bg-white rounded-xl p-1 border border-gray-100 shadow-sm overflow-x-auto scrollbar-hide">
            {['all', 'week', 'month', 'custom'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap",
                  filter === f ? "bg-sidebar text-white shadow-md" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {f === 'all' ? 'Tudo' : f === 'week' ? 'Semana' : f === 'month' ? 'Mês' : 'Personalizado'}
              </button>
            ))}
          </div>
          {filter === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
              <input 
                type="date" 
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-sidebar/10 outline-none"
                value={customRange.start}
                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
              />
              <span className="text-gray-400 text-xs">até</span>
              <input 
                type="date" 
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-sidebar/10 outline-none"
                value={customRange.end}
                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          )}
            <button 
              onClick={handleSync}
              disabled={isSyncing || !hasUnprocessedEarnings}
              className={cn(
                "bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed",
                hasUnprocessedEarnings && !isSyncing && "animate-pulse"
              )}
            >
              {isSyncing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 sm:w-5 h-5" />
                  Sincronizar Plataformas
                </>
              )}
            </button>
            <button 
              onClick={() => toast.info('Relatório detalhado em PDF sendo gerado...')}
              className="bg-sidebar text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 text-sm"
            >
              <Download className="w-4 h-4 sm:w-5 h-5" />
              Baixar Extrato
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-100 pb-px">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            "px-6 py-3 text-sm font-black uppercase tracking-widest transition-all relative",
            activeTab === 'dashboard' ? "text-sidebar" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Dashboard
          {activeTab === 'dashboard' && <div className="absolute bottom-0 left-0 w-full h-1 bg-sidebar rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={cn(
            "px-6 py-3 text-sm font-black uppercase tracking-widest transition-all relative",
            activeTab === 'services' ? "text-sidebar" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Meus Serviços
          {activeTab === 'services' && <div className="absolute bottom-0 left-0 w-full h-1 bg-sidebar rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('estafeta')}
          className={cn(
            "px-6 py-3 text-sm font-black uppercase tracking-widest transition-all relative",
            activeTab === 'estafeta' ? "text-sidebar" : "text-gray-400 hover:text-gray-600"
          )}
        >
          Estafeta (Pontos)
          {activeTab === 'estafeta' && <div className="absolute bottom-0 left-0 w-full h-1 bg-sidebar rounded-t-full" />}
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Quick Actions Grid for Mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:hidden">
            <button 
              onClick={() => window.location.href = '/dashboard/chat'}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2"
            >
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-gray-600">Chat Suporte</span>
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard/claims'}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2"
            >
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-gray-600">Sinistros</span>
            </button>
            <button 
              onClick={() => setShowExpenseModal(true)}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2"
            >
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Receipt className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-gray-600">Despesas</span>
            </button>
            <button 
              onClick={() => setShowVehicleModal(true)}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2"
            >
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Car className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-gray-600">Meu Carro</span>
            </button>
          </div>

          {/* Balance Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-48 h-48 bg-sidebar/5 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-gray-400 mb-6">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-widest">Saldo Total da Conta</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                  <h3 className="text-3xl sm:text-5xl font-black tracking-tighter text-gray-900">{formatCurrency(totalBalance)}</h3>
                  <span className="w-fit text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+4.2%</span>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-8 relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ganhos Líquidos Totais</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(paidBalance)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pagamentos Pendentes</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(pendingBalance)}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    12%
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Ganhos Brutos (Hoje)</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(125.70)}</h3>
                </div>
              </div>

              <div className="bg-sidebar p-6 rounded-[32px] shadow-xl text-white relative overflow-hidden flex flex-col justify-between">
                <div className="absolute right-0 bottom-0 opacity-10">
                  <Euro className="w-32 h-32 -mb-8 -mr-8" />
                </div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-sidebar-foreground uppercase tracking-widest">Próximo Pagamento</span>
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] text-sidebar-foreground font-bold uppercase tracking-widest mb-1">Período: {getUberPeriod(new Date(), 0)}</p>
                  <p className="text-sm text-sidebar-foreground font-medium">Pagamento: Segunda-feira, 02 Mar</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(pendingBalance)}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daily Bar Chart */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold">Ganhos Diários</h3>
                    <p className="text-xs text-gray-400 mt-1">Comparativo Uber vs Bolt na semana atual</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Uber</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Bolt</span>
                    </div>
                  </div>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 600}} 
                        dy={10} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fill: '#9ca3af'}} 
                        tickFormatter={(value) => `€${value}`}
                      />
                      <Tooltip 
                        cursor={{fill: '#f9fafb'}}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [formatCurrency(Number(value)), '']}
                      />
                      <Bar dataKey="uber" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                      <Bar dataKey="bolt" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed History */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold">Histórico de Pagamentos</h3>
                <button className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-sidebar transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {filteredHistory.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className={cn(
                      "p-5 bg-gray-50 rounded-2xl border transition-all group cursor-pointer relative overflow-hidden",
                      expandedId === item.id ? "border-sidebar/30 bg-white shadow-md" : "border-gray-100 hover:border-sidebar/20"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.period_start} - {item.period_end}</span>
                      <span className={cn(
                        "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                        item.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {item.status === 'paid' ? 'Pago' : 'Processando'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-black text-gray-900">{formatCurrency(item.net_amount)}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Líquido a Receber</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-500">{formatCurrency(item.gross_revenue)}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Total Bruto</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Meus Serviços Agendados</h2>
            <span className="text-[10px] font-black bg-sidebar text-white px-2 py-1 rounded-full uppercase tracking-widest">
              {myServices.filter(s => s.status !== 'completed' && s.status !== 'canceled').length} Pendentes
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myServices
              .map(service => (
                <div key={service.id} className={cn(
                  "bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group",
                  service.status === 'completed' && "opacity-60"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-2xl",
                      'flight_number' in service ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      {'flight_number' in service ? <Plane className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter",
                        service.status === 'in_progress' ? "bg-amber-100 text-amber-700" : 
                        service.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {service.status === 'in_progress' ? 'Em Curso' : service.status === 'completed' ? 'Concluído' : 'Agendado'}
                      </span>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                        {new Date(service.scheduled_at).toLocaleDateString('pt-PT')} • {new Date(service.scheduled_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Recolha</p>
                        <p className="text-sm font-bold text-gray-900">{service.pickup_location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Navigation className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Destino</p>
                        <p className="text-sm font-bold text-gray-900">{service.dropoff_location}</p>
                      </div>
                    </div>
                  </div>

                  {service.status !== 'completed' && (
                    <div className="flex items-center gap-2">
                      {service.status === 'scheduled' ? (
                        <button 
                          onClick={() => handleUpdateServiceStatus(service, 'in_progress')}
                          className="flex-1 bg-sidebar text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
                        >
                          <Play className="w-4 h-4" />
                          Iniciar Serviço
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateServiceStatus(service, 'completed')}
                          className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Concluir Serviço
                        </button>
                      )}
                      <button 
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(service.dropoff_location)}`, '_blank')}
                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-gray-600 transition-all"
                      >
                        <Navigation className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {activeTab === 'estafeta' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Pontos de Entrega (Estafeta)</h2>
            <p className="text-sm text-gray-500 font-medium">Locais parceiros para recolha e entrega de encomendas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveryPoints.map(point => (
              <div key={point.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm group hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    point.type === 'restaurant' ? "bg-orange-50 text-orange-600" :
                    point.type === 'commercial_center' ? "bg-purple-50 text-purple-600" :
                    "bg-blue-50 text-blue-600"
                  )}>
                    {point.type === 'restaurant' ? <Euro className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                  </div>
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.name + ' ' + point.address)}`, '_blank')}
                    className="p-2 text-gray-400 hover:text-sidebar transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-black text-gray-900">{point.name}</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">{point.address}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-lg">
                    {point.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-lg">
                    {point.city}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6">Calendário de Pagamentos TVDE (Semanal)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-bold">Ciclo de Ganhos</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              A semana de ganhos decorre de **Segunda-feira (04:00)** até à **Segunda-feira seguinte (03:59)**. Todos os valores são consolidados automaticamente.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-bold">Data de Pagamento</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Os pagamentos são processados na Segunda-feira. O valor líquido estará disponível na sua conta no próprio dia.
            </p>
          </div>
        </div>
      </div>

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">Submeter Despesa</h2>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categoria</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10 font-bold"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                >
                  <option value="fuel">Combustível</option>
                  <option value="toll">Portagens</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="cleaning">Limpeza</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Valor (€)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10 font-bold"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10 font-bold"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descrição</label>
                <textarea 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10 font-medium text-sm h-24"
                  placeholder="Ex: Abastecimento Galp..."
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Comprovativo (Foto/PDF)</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <p className="text-[10px] text-gray-500 font-bold">Carregar Fatura</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*,.pdf" />
                </label>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-sidebar text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-sidebar/20 mt-4"
              >
                Enviar para Aprovação
              </button>
            </form>
          </div>
        </div>
      )}

      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Atualizar Dados do Veículo</h2>
                <p className="text-sm text-gray-500 mt-1">Insira as informações e documentos da sua viatura.</p>
              </div>
              <button onClick={() => setShowVehicleModal(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Marca</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10 font-bold"
                    value={vehicleData.brand}
                    onChange={(e) => setVehicleData({...vehicleData, brand: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Modelo</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10 font-bold"
                    value={vehicleData.model}
                    onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Matrícula</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10 font-mono font-bold"
                    value={vehicleData.plate}
                    onChange={(e) => setVehicleData({...vehicleData, plate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ano</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10 font-bold"
                    value={vehicleData.year}
                    onChange={(e) => setVehicleData({...vehicleData, year: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold text-gray-900">Documentação e Validades</h3>
                <div className="grid grid-cols-1 gap-4">
                  {vehicleData.documents.map((doc, index) => (
                    <div key={doc.name} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-2 gap-6 items-end">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{doc.name}</label>
                        <input 
                          type="date" 
                          className="w-full px-4 py-2 bg-white border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-sidebar/10 text-sm font-bold"
                          value={doc.expiry}
                          onChange={(e) => {
                            const newDocs = [...vehicleData.documents];
                            newDocs[index].expiry = e.target.value;
                            setVehicleData({...vehicleData, documents: newDocs});
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-100 transition-all text-xs font-bold text-gray-600">
                          <Upload className="w-4 h-4" />
                          Upload PDF
                          <input type="file" className="hidden" accept=".pdf" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 flex gap-4">
              <button 
                onClick={() => setShowVehicleModal(false)}
                className="flex-1 py-4 bg-white text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-100"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowVehicleModal(false);
                  toast.success('Dados do veículo atualizados com sucesso!');
                }}
                className="flex-1 py-4 bg-sidebar text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-sidebar/20"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

