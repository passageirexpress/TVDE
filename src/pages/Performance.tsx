import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Car, 
  Euro, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Cell,
  Pie
} from 'recharts';
import { formatCurrency } from '../lib/utils';
import { useDataStore } from '../store/useDataStore';

const data = [
  { name: 'Seg', earnings: 4000, expenses: 2400 },
  { name: 'Ter', earnings: 3000, expenses: 1398 },
  { name: 'Qua', earnings: 2000, expenses: 9800 },
  { name: 'Qui', earnings: 2780, expenses: 3908 },
  { name: 'Sex', earnings: 1890, expenses: 4800 },
  { name: 'Sáb', earnings: 2390, expenses: 3800 },
  { name: 'Dom', earnings: 3490, expenses: 4300 },
];

const pieData = [
  { name: 'Uber', value: 65 },
  { name: 'Bolt', value: 35 },
];

const COLORS = ['#050505', '#00FF00'];

export default function Performance() {
  const { drivers, vehicles, payments, expenses, fetchFromSupabase } = useDataStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const totalRevenue = payments.reduce((acc, p) => acc + (p.gross_revenue || p.gross || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const avgRevenuePerDriver = drivers.length > 0 ? totalRevenue / drivers.length : 0;
  const fleetEfficiency = vehicles.length > 0 ? (vehicles.filter(v => v.status === 'active').length / vehicles.length) * 100 : 0;
  const netMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

  const chartData = [
    { name: 'Jan', earnings: 4000, expenses: 2400 },
    { name: 'Fev', earnings: 3000, expenses: 1398 },
    { name: 'Mar', earnings: 2000, expenses: 9800 },
    { name: 'Abr', earnings: 2780, expenses: 3908 },
    { name: 'Mai', earnings: 1890, expenses: 4800 },
    { name: 'Jun', earnings: totalRevenue, expenses: totalExpenses },
  ];

  const platformData = [
    { name: 'Uber', value: 65 },
    { name: 'Bolt', value: 35 },
  ];

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
      alert('Sincronização concluída com sucesso!');
    } catch (error: any) {
      alert('Erro na sincronização: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Desempenho da Frota</h1>
          <p className="text-gray-500 mt-1">Análise detalhada de produtividade e rentabilidade.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-sidebar text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-sidebar/20 disabled:opacity-50"
          >
            {isSyncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Sincronizar Agora
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
            <Calendar className="w-4 h-4" />
            Últimos 30 dias
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Faturamento Total', value: formatCurrency(totalRevenue), icon: Euro, trend: '+12.5%', trendUp: true },
          { label: 'Média por Motorista', value: formatCurrency(avgRevenuePerDriver), icon: Users, trend: '+3.2%', trendUp: true },
          { label: 'Eficiência da Frota', value: `${fleetEfficiency.toFixed(0)}%`, icon: Car, trend: '-1.5%', trendUp: false },
          { label: 'Margem Líquida', value: `${netMargin.toFixed(1)}%`, icon: TrendingUp, trend: '+4.1%', trendUp: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <stat.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              Evolução de Ganhos vs Despesas
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="earnings" fill="#050505" radius={[4, 4, 0, 0]} name="Ganhos" />
                <Bar dataKey="expenses" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-gray-400" />
            Distribuição por Plataforma
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {platformData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}} />
                  <span className="text-sm font-medium text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-bold">Top Motoristas por Faturamento</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Motorista</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Faturamento</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Eficiência</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {drivers.slice(0, 5).map((driver, i) => {
                const driverRevenue = payments
                  .filter(p => p.driver_id === driver.id)
                  .reduce((acc, p) => acc + (p.gross_revenue || p.gross || 0), 0);
                
                return (
                  <tr key={driver.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold">
                          {driver.full_name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold">{driver.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">{formatCurrency(driverRevenue)}</td>
                    <td className="px-6 py-4">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{width: `${95 - (i * 5)}%`}} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Excelente
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
