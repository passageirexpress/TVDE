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
  X
} from 'lucide-react';
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
  const { expenses, vehicles, drivers } = useDataStore();
  const [history, setHistory] = useState(initialHistory);
  const [filter, setFilter] = useState('all');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  
  const myExpenses = expenses.filter(e => e.driver_id === user?.id && e.status === 'approved');
  const myVehicle = vehicles.find(v => v.current_driver_id === user?.id);
  const myDriverData = drivers.find(d => d.id === user?.id);

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

  // Simulate payment received after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory(prev => prev.map(item => {
        if (item.id === '1' && item.status === 'processing') {
          // Trigger notification and sound
          setShowNotification(true);
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
          }
          return { ...item, status: 'paid' as const };
        }
        return item;
      }));
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    const itemDate = new Date(item.date);
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

  const totalBalance = filteredHistory.reduce((acc, curr) => acc + curr.net, 0);
  const pendingBalance = filteredHistory.filter(h => h.status === 'processing').reduce((acc, curr) => acc + curr.net, 0);
  const paidBalance = filteredHistory.filter(h => h.status === 'paid').reduce((acc, curr) => acc + curr.net, 0);

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
            onClick={() => alert('Relatório detalhado em PDF sendo gerado...')}
            className="bg-sidebar text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 text-sm"
          >
            <Download className="w-4 h-4 sm:w-5 h-5" />
            Baixar Extrato
          </button>
        </div>
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

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold">Minhas Despesas (Lançadas pela Empresa)</h3>
                <p className="text-xs text-gray-400 mt-1">Despesas operacionais associadas ao seu perfil</p>
              </div>
              <button 
                onClick={() => alert('Exportando histórico de despesas...')}
                className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-sidebar transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {myExpenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-gray-400">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 capitalize">{expense.category}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{expense.date} • {expense.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">{formatCurrency(expense.amount)}</p>
                    <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Aprovado</span>
                  </div>
                </div>
              ))}
              {myExpenses.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Nenhuma despesa registada.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold">Meu Veículo</h3>
                <p className="text-xs text-gray-400 mt-1">Dados e documentos da viatura atual</p>
              </div>
              <button 
                onClick={() => setShowVehicleModal(true)}
                className="bg-sidebar text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all"
              >
                Atualizar Dados
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-sidebar">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">{vehicleData.brand} {vehicleData.model}</h4>
                    <p className="text-xs text-gray-500 font-mono">{vehicleData.plate} • {vehicleData.year}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Categoria</p>
                    <p className="text-sm font-bold">{vehicleData.category}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Status</p>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Ativo</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Documentação</p>
                {vehicleData.documents.map(doc => (
                  <div key={doc.name} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs font-bold text-gray-700">{doc.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold">Expira em</p>
                      <p className="text-xs font-bold text-gray-900">{doc.expiry}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold">Taxas de Desempenho</h3>
                <p className="text-xs text-gray-400 mt-1">Aceitação vs Cancelamento</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Aceitação</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Cancelamento</span>
                </div>
              </div>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Aceitação', value: myDriverData?.acceptance_rate || 0, fill: '#10b981' },
                  { name: 'Cancelamento', value: myDriverData?.cancellation_rate || 0, fill: '#ef4444' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                    {
                      [
                        { name: 'Aceitação', value: myDriverData?.acceptance_rate || 0, fill: '#10b981' },
                        { name: 'Cancelamento', value: myDriverData?.cancellation_rate || 0, fill: '#ef4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-sidebar/5 text-sidebar rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Dados para Faturamento</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Empresa</p>
                  <p className="text-sm font-bold text-gray-900">{companyData.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">NIF</p>
                  <p className="text-sm font-bold text-gray-900">{companyData.nif}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Morada</p>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">{companyData.address}</p>
                </div>
                <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-emerald-600">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-bold">Emitir Recibo Verde com IVA 6%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">Enviar Recibo Verde</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Carregue o seu recibo verde mensal para que possamos processar o seu pagamento.
                </p>
              </div>
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-sidebar/30 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 font-bold">Clique para carregar PDF</p>
                  </div>
                  <input type="file" className="hidden" accept=".pdf" onChange={() => alert('Recibo carregado com sucesso! Aguarde validação.')} />
                </label>
                <button className="w-full py-3 bg-sidebar text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-sidebar/20">
                  Enviar para Empresa
                </button>
              </div>
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
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.period}</span>
                  <span className={cn(
                    "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border",
                    item.status === 'paid' 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
                  )}>
                    {item.status === 'paid' ? 'Pago' : 'Processando'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Líquido Recebido</p>
                    <p className="text-xl font-black tracking-tight text-gray-900">{formatCurrency(item.net)}</p>
                  </div>
                  <div className={cn(
                    "w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm transition-all",
                    expandedId === item.id ? "bg-sidebar text-white rotate-90" : "group-hover:bg-sidebar group-hover:text-white"
                  )}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-2 flex justify-end">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowVehicleModal(true);
                    }}
                    className="text-[10px] font-bold text-sidebar hover:underline flex items-center gap-1"
                  >
                    <Car className="w-3 h-3" />
                    Ver Veículo
                  </button>
                </div>

                {expandedId === item.id && (
                  <div className="mt-5 pt-5 border-t border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Uber</p>
                        </div>
                        <div className="pl-4">
                          <p className="text-sm font-bold">{formatCurrency(item.uber)}</p>
                          <p className="text-[10px] text-red-500 font-medium">Comissão: -{formatCurrency(item.commission_uber)}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Bolt</p>
                        </div>
                        <div className="pl-4">
                          <p className="text-sm font-bold">{formatCurrency(item.bolt)}</p>
                          <p className="text-[10px] text-red-500 font-medium">Comissão: -{formatCurrency(item.commission_bolt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500">Total Bruto</span>
                        <span className="text-sm font-black">{formatCurrency(item.total)}</span>
                      </div>
                      <div className="flex justify-between items-center text-red-500">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Comissões Plataformas</span>
                        <span className="text-xs font-bold">-{formatCurrency(item.commission_uber + item.commission_bolt)}</span>
                      </div>
                      {myExpenses.length > 0 && (
                        <div className="pt-2 border-t border-gray-200 space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Despesas Deduzidas</p>
                          {myExpenses.map(e => (
                            <div key={e.id} className="flex justify-between items-center text-red-500">
                              <span className="text-[10px] text-gray-500 capitalize">{e.category}</span>
                              <span className="text-xs">-{formatCurrency(e.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredHistory.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-400 text-sm italic">Nenhum pagamento encontrado para este período.</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
                  alert('Dados do veículo atualizados com sucesso!');
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

