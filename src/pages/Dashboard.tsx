import React, { useState, useEffect, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  Users, 
  Car, 
  Building2,
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Euro,
  Database,
  CheckCircle2,
  XCircle,
  Plane,
  Package,
  Truck,
  Clock as ClockIcon,
  ChevronRight,
  RefreshCw,
  Map as MapIcon,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency, getUberPeriod, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, link }: any) => (
  <Link to={link || '#'} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow block">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gray-50 rounded-xl">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
          trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trendValue}
        </div>
      )}
    </div>
    <p className="text-sm text-gray-500 font-medium">{title}</p>
    <h3 className="text-2xl font-bold mt-1">{value}</h3>
  </Link>
);

export default function Dashboard() {
  const { drivers, vehicles, payments, expenses, transfers, deliveries, claims, maintenances, fetchFromSupabase, isLoading } = useDataStore();
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  const [isSyncing, setIsSyncing] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const handleVivaDiagnostic = async () => {
    setIsDiagnosing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/viva/diagnostic', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message, {
          description: `Status: ${result.status} | Modo: ${result.mode}`,
          duration: 5000
        });
      } else {
        throw new Error(result.error || result.details || 'Erro desconhecido');
      }
    } catch (error: any) {
      toast.error('Falha no Diagnóstico Viva Wallet', {
        description: error.message,
        duration: 8000
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem('sb-access-token');
      
      // Sync Bolt
      const boltRes = await fetch('/api/bolt/sync', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Sync Uber
      const uberRes = await fetch('/api/uber/sync', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!boltRes.ok || !uberRes.ok) {
        throw new Error('Erro ao sincronizar com uma ou mais plataformas.');
      }

      await fetchFromSupabase();
      toast.success('Sincronização concluída com sucesso!');
    } catch (error: any) {
      toast.error('Erro na sincronização: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try to fetch something simple to verify connection
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) throw error;
        setDbStatus('connected');
      } catch (err) {
        console.error('Supabase connection error:', err);
        setDbStatus('error');
      }
    };

    checkConnection();
  }, []);

  const activeDriversCount = drivers.filter(d => d.status === 'active').length;
  const activeVehiclesCount = vehicles.filter(v => v.status === 'active').length;
  
  const totalGrossRevenue = payments.reduce((acc, p) => acc + (p.gross_revenue || p.gross || 0), 0);
  const totalCompanyCommission = totalGrossRevenue * 0.25; // Assuming 25% average
  
  // IVA Calculation (6% of gross)
  const totalIVA = totalGrossRevenue * 0.06;

  // Projections
  const monthlyIVA = totalIVA; // Assuming current data is for a month or similar period for demo
  const quarterlyIVA = monthlyIVA * 3;
  const semiAnnualIVA = monthlyIVA * 6;
  const annualIVA = monthlyIVA * 12;

  const projectionData = [
    { name: 'Mensal', iva: monthlyIVA },
    { name: 'Trimestral', iva: quarterlyIVA },
    { name: 'Semestral', iva: semiAnnualIVA },
    { name: 'Anual', iva: annualIVA },
  ];

  const pendingPaymentsTotal = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + (p.net_amount || p.net || 0), 0);

  const activeTransfers = transfers.filter(t => t.status === 'scheduled' || t.status === 'in_progress');
  const activeDeliveries = deliveries.filter(d => d.status === 'scheduled' || d.status === 'in_progress');

  const user = useAuthStore(state => state.user);
  const { companies } = useDataStore();

  const criticalAlerts = vehicles
    .filter(v => {
      const insuranceExpiry = new Date(v.insurance_expiry);
      const inspectionExpiry = new Date(v.inspection_expiry);
      const today = new Date();
      const diffInsurance = Math.ceil((insuranceExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const diffInspection = Math.ceil((inspectionExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffInsurance <= 7 || diffInspection <= 7;
    })
    .map(v => {
      const insuranceExpiry = new Date(v.insurance_expiry);
      const inspectionExpiry = new Date(v.inspection_expiry);
      const today = new Date();
      const diffInsurance = Math.ceil((insuranceExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const diffInspection = Math.ceil((inspectionExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      const companyName = user?.role === 'master' ? ` (${companies.find(c => c.id === v.company_id)?.name || 'N/A'})` : '';

      if (diffInsurance <= 7) {
        return {
          title: 'Seguro a Vencer',
          message: `O seguro da viatura ${v.plate}${companyName} vence em ${diffInsurance} dias.`,
          type: 'red'
        };
      }
      return {
        title: 'Inspeção a Vencer',
        message: `A inspeção da viatura ${v.plate}${companyName} vence em ${diffInspection} dias.`,
        type: 'amber'
      };
    });

  const chartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      const monthName = months[monthIdx];
      
      const monthPayments = payments.filter(p => {
        const pDate = new Date(p.date || p.payment_date || p.period_start);
        return pDate.getMonth() === monthIdx;
      });

      const uber = monthPayments.filter(p => p.platform === 'uber').reduce((acc, p) => acc + (p.gross_revenue || p.gross || 0), 0);
      const bolt = monthPayments.filter(p => p.platform === 'bolt').reduce((acc, p) => acc + (p.gross_revenue || p.gross || 0), 0);
      const total = uber + bolt;

      data.push({
        name: monthName,
        revenue: total,
        uber: uber,
        bolt: bolt
      });
    }
    return data;
  }, [payments]);

  const vehicleProfitData = useMemo(() => {
    return vehicles.slice(0, 5).map(v => {
      const vehicleRevenue = payments
        .filter(p => p.driver_id === v.current_driver_id)
        .reduce((acc, p) => acc + (p.gross_revenue || p.gross || 0), 0);
      
      const vehicleExpenses = expenses
        .filter(e => e.driver_id === v.current_driver_id || (e.description && e.description.includes(v.plate)))
        .reduce((acc, e) => acc + e.amount, 0);

      return {
        name: v.plate,
        revenue: vehicleRevenue,
        expenses: vehicleExpenses,
        profit: vehicleRevenue - vehicleExpenses
      };
    });
  }, [vehicles, payments, expenses]);

  const topDrivers = [...drivers]
    .sort((a, b) => (b.rating_uber + b.rating_bolt) - (a.rating_uber + a.rating_bolt))
    .slice(0, 5);

  const recentActivity = useMemo(() => {
    const activities = [
      ...claims.map(c => ({ id: c.id, type: 'claim', title: 'Novo Sinistro', description: c.description, date: c.created_at || c.date, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' })),
      ...maintenances.map(m => ({ id: m.id, type: 'maintenance', title: 'Manutenção Concluída', description: m.description, date: m.created_at || m.date, icon: Car, color: 'text-amber-500', bg: 'bg-amber-50' })),
      ...expenses.filter(e => e.status === 'pending').map(e => ({ id: e.id, type: 'expense', title: 'Nova Despesa Pendente', description: e.description, date: e.date, icon: Euro, color: 'text-blue-500', bg: 'bg-blue-50' })),
      ...payments.filter(p => p.status === 'paid').map(p => ({ id: p.id, type: 'payment', title: 'Pagamento Efetuado', description: `Pago a ${drivers.find(d => d.id === p.driver_id)?.full_name}`, date: p.payment_date || p.date || '', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return activities.slice(0, 5);
  }, [claims, maintenances, expenses, payments, drivers]);

  if (user?.role === 'master') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel Master</h1>
            <p className="text-gray-500 mt-1">Visão geral de todo o ecossistema SaaS.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleVivaDiagnostic}
              disabled={isDiagnosing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isDiagnosing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              Testar Viva Wallet (Prod)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total de Empresas" 
            value={companies.length.toString()} 
            icon={Building2} 
            link="/dashboard/companies"
          />
          <StatCard 
            title="Total de Motoristas" 
            value={drivers.length.toString()} 
            icon={Users} 
            link="/dashboard/users"
          />
          <StatCard 
            title="Total de Veículos" 
            value={vehicles.length.toString()} 
            icon={Car} 
            link="/dashboard/vehicles"
          />
          <StatCard 
            title="Receita Global Bruta" 
            value={formatCurrency(totalGrossRevenue)} 
            icon={TrendingUp} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6">Empresas por Plano</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Free', count: companies.filter(c => c.plan === 'free').length },
                  { name: 'Pro', count: companies.filter(c => c.plan === 'pro').length },
                  { name: 'Enterprise', count: companies.filter(c => c.plan === 'enterprise').length },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6">Alertas Críticos (Global)</h3>
            <div className="space-y-4">
              {criticalAlerts.length > 0 ? (
                criticalAlerts.slice(0, 5).map((alertItem, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "flex gap-4 p-4 rounded-xl border",
                      alertItem.type === 'red' ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"
                    )}
                  >
                    <AlertCircle className={cn("w-5 h-5 shrink-0", alertItem.type === 'red' ? "text-red-600" : "text-amber-600")} />
                    <div>
                      <p className={cn("text-sm font-bold", alertItem.type === 'red' ? "text-red-900" : "text-amber-900")}>{alertItem.title}</p>
                      <p className={cn("text-xs mt-0.5", alertItem.type === 'red' ? "text-red-700" : "text-amber-700")}>{alertItem.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">Nenhum alerta crítico global.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bem-vindo de volta ao seu painel de gestão de frota.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
            dbStatus === 'checking' && "bg-gray-50 text-gray-500 border-gray-200",
            dbStatus === 'connected' && "bg-emerald-50 text-emerald-600 border-emerald-100",
            dbStatus === 'error' && "bg-red-50 text-red-600 border-red-100"
          )}>
            <Database className={cn("w-3.5 h-3.5", dbStatus === 'checking' && "animate-pulse")} />
            {dbStatus === 'checking' && "Verificando Banco..."}
            {dbStatus === 'connected' && "Banco Conectado"}
            {dbStatus === 'error' && "Erro de Conexão"}
            {dbStatus === 'connected' && <CheckCircle2 className="w-3 h-3" />}
            {dbStatus === 'error' && <XCircle className="w-3 h-3" />}
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-sidebar text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-sidebar/20 disabled:opacity-50"
          >
            {isSyncing || isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Sincronizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Motoristas Ativos" 
          value={activeDriversCount.toString()} 
          icon={Users} 
          trend="up" 
          trendValue="+12%" 
          link="/dashboard/drivers"
        />
        <StatCard 
          title="Veículos em Operação" 
          value={activeVehiclesCount.toString()} 
          icon={Car} 
          link="/dashboard/vehicles"
        />
        <StatCard 
          title="Receita Bruta" 
          value={formatCurrency(totalGrossRevenue)} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="+8.4%" 
          link="/dashboard/finance"
        />
        <StatCard 
          title="Serviços Ativos" 
          value={(activeTransfers.length + activeDeliveries.length).toString()} 
          icon={Truck} 
          link="/dashboard/services"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fleet Map Widget */}
        <div className="lg:col-span-2 bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Mapa da Frota</h3>
              <p className="text-sm text-gray-500 font-medium">Localização em tempo real</p>
            </div>
            <Link to="/dashboard/fleet-map" className="p-3 bg-sidebar/5 text-sidebar rounded-2xl hover:bg-sidebar/10 transition-all">
              <MapIcon className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex-1 relative min-h-[300px] bg-gray-50 group">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="absolute -inset-4 bg-sidebar/10 rounded-full animate-ping"></div>
                  <MapIcon className="w-12 h-12 text-sidebar relative z-10" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Mapa Interativo Ativo</p>
                <Link 
                  to="/dashboard/fleet-map"
                  className="inline-block px-6 py-3 bg-sidebar text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-sidebar/20"
                >
                  Abrir Mapa Completo
                </Link>
              </div>
            </div>
            {/* Simulated mini markers */}
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse delay-75"></div>
            <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-sm animate-pulse delay-150"></div>
          </div>
        </div>

        {/* Recent Activity Widget */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Atividade Recente</h3>
              <p className="text-sm text-gray-500 font-medium">Últimos eventos da frota</p>
            </div>
            <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="p-4 space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                <div className={cn("p-3 rounded-xl shrink-0", activity.bg, activity.color)}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-black text-gray-900 truncate">{activity.title}</p>
                    <span className="text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap ml-2">
                      {new Date(activity.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{activity.description}</p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-sm text-gray-400 font-medium italic">Nenhuma atividade recente registada.</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Operations Widget */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Operações em Tempo Real</h3>
              <p className="text-sm text-gray-500 font-medium">Próximos Transfers e Entregas</p>
            </div>
            <Link to="/dashboard/services" className="text-xs font-black text-sidebar hover:underline uppercase tracking-widest">Ver Todos</Link>
          </div>
          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {[...activeTransfers, ...activeDeliveries]
              .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
              .slice(0, 5)
              .map(service => (
                <div key={service.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between group hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      'flight_number' in service ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {'flight_number' in service ? <Plane className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">
                        {'flight_number' in service ? `Transfer ${service.flight_number || ''}` : `Entrega: ${service.pickup_location.split(',')[0]}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <ClockIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                          {new Date(service.scheduled_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-full uppercase",
                          service.status === 'in_progress' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {service.status === 'in_progress' ? 'Em Curso' : 'Agendado'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                </div>
              ))}
            {activeTransfers.length === 0 && activeDeliveries.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-sm text-gray-400 font-medium italic">Sem operações ativas no momento.</p>
              </div>
            )}
          </div>
        </div>

        {/* IVA Table and Projections */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Gestão de IVA (6%)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-widest">Período</th>
                  <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-widest">Faturamento</th>
                  <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-widest">IVA a Pagar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="py-4 text-sm font-medium">Mensal (Atual)</td>
                  <td className="py-4 text-sm font-bold">{formatCurrency(totalGrossRevenue)}</td>
                  <td className="py-4 text-sm font-bold text-red-500">{formatCurrency(monthlyIVA)}</td>
                </tr>
                <tr>
                  <td className="py-4 text-sm font-medium">Trimestral (Projeção)</td>
                  <td className="py-4 text-sm font-bold">{formatCurrency(totalGrossRevenue * 3)}</td>
                  <td className="py-4 text-sm font-bold text-red-500">{formatCurrency(quarterlyIVA)}</td>
                </tr>
                <tr>
                  <td className="py-4 text-sm font-medium">Semestral (Projeção)</td>
                  <td className="py-4 text-sm font-bold">{formatCurrency(totalGrossRevenue * 6)}</td>
                  <td className="py-4 text-sm font-bold text-red-500">{formatCurrency(semiAnnualIVA)}</td>
                </tr>
                <tr>
                  <td className="py-4 text-sm font-medium">Anual (Projeção)</td>
                  <td className="py-4 text-sm font-bold">{formatCurrency(totalGrossRevenue * 12)}</td>
                  <td className="py-4 text-sm font-bold text-red-500">{formatCurrency(annualIVA)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Projeção de IVA Anual</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [formatCurrency(Number(value)), 'IVA']}
                />
                <Bar dataKey="iva" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Rentabilidade por Viatura</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Lucro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Despesas</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleProfitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Ranking de Motoristas</h3>
          <div className="space-y-6">
            {topDrivers.map((driver, idx) => (
              <div key={driver.id} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{driver.full_name}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{driver.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{driver.rating_uber} ★</p>
                  <p className="text-[10px] text-gray-400">Rating Médio</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/dashboard/drivers" className="mt-8 block text-center py-3 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all">
            Ver Todos os Motoristas
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Evolução da Receita (Últimos 6 Meses)</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Uber</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Bolt</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Bar dataKey="uber" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="bolt" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4">Alertas Críticos</h3>
            <div className="space-y-4">
              {criticalAlerts.length > 0 ? (
                criticalAlerts.map((alertItem, idx) => (
                  <div 
                    key={idx}
                    onClick={() => toast.info('Redirecionando para detalhes do veículo...')}
                    className={cn(
                      "flex gap-4 p-4 rounded-xl border cursor-pointer transition-colors",
                      alertItem.type === 'red' ? "bg-red-50 border-red-100 hover:bg-red-100" : "bg-amber-50 border-amber-100 hover:bg-amber-100"
                    )}
                  >
                    <AlertCircle className={cn("w-5 h-5 shrink-0", alertItem.type === 'red' ? "text-red-600" : "text-amber-600")} />
                    <div>
                      <p className={cn("text-sm font-bold", alertItem.type === 'red' ? "text-red-900" : "text-amber-900")}>{alertItem.title}</p>
                      <p className={cn("text-xs mt-0.5", alertItem.type === 'red' ? "text-red-700" : "text-amber-700")}>{alertItem.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">Nenhum alerta crítico.</p>
              )}
            </div>
          </div>

          <Link to="/dashboard/finance" className="bg-sidebar p-6 rounded-2xl shadow-lg text-white block hover:bg-black transition-all">
            <h3 className="text-lg font-bold mb-2">Próximo Pagamento</h3>
            <p className="text-sidebar-foreground text-sm">Período: {getUberPeriod()}</p>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-xs text-sidebar-foreground uppercase tracking-widest">Total Estimado</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(pendingPaymentsTotal)}</p>
              </div>
              <div className="bg-white/10 p-2 rounded-lg">
                <Euro className="w-6 h-6" />
              </div>
            </div>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Pagamentos Pendentes</h3>
            <Link to="/dashboard/finance" className="text-xs font-bold text-sidebar uppercase tracking-widest hover:underline">
              Ver Todos
            </Link>
          </div>
          <div className="space-y-4">
            {payments.filter(p => p.status === 'pending').length > 0 ? (
              payments
                .filter(p => p.status === 'pending')
                .slice(0, 5)
                .map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-sidebar/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400">
                        <Euro className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{payment.driver || drivers.find(d => d.id === payment.driver_id)?.full_name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{payment.period || 'Período não definido'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-sidebar">{formatCurrency(payment.net_amount || payment.net || 0)}</p>
                      <Link 
                        to={`/dashboard/finance`} 
                        className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-sidebar transition-colors"
                      >
                        Detalhes
                      </Link>
                    </div>
                  </div>
                ))
            ) : (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-100 mx-auto mb-4" />
                <p className="text-sm text-gray-500 font-medium">Todos os pagamentos estão em dia!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
