import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Car,
  Users,
  AlertCircle
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { formatCurrency, cn } from '../lib/utils';
import Papa from 'papaparse';

const COLORS = ['#1a1a1a', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function Reports() {
  const { payments, expenses, vehicles, drivers, earningImports } = useDataStore();
  const [period, setPeriod] = useState('month');

  const stats = useMemo(() => {
    const totalRevenue = payments.reduce((acc, p) => acc + (p.gross_revenue || p.gross || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalNet = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (totalNet / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      totalNet,
      margin
    };
  }, [payments, expenses]);

  const revenueByPlatform = useMemo(() => {
    const data = [
      { name: 'Uber', value: earningImports.filter(e => e.platform === 'uber').reduce((acc, e) => acc + e.amount, 0) },
      { name: 'Bolt', value: earningImports.filter(e => e.platform === 'bolt').reduce((acc, e) => acc + e.amount, 0) },
      { name: 'Transfers', value: 0 }, // Placeholder for future service revenue
      { name: 'Entregas', value: 0 }
    ];
    return data.filter(d => d.value > 0);
  }, [earningImports]);

  const monthlyData = useMemo(() => {
    // Group by month
    const months: any = {};
    payments.forEach(p => {
      const date = new Date(p.date || p.payment_date || p.period_start);
      const month = date.toLocaleString('pt-PT', { month: 'short' });
      if (!months[month]) months[month] = { name: month, receita: 0, despesa: 0 };
      months[month].receita += (p.gross_revenue || p.gross || 0);
    });

    expenses.forEach(e => {
      const date = new Date(e.date);
      const month = date.toLocaleString('pt-PT', { month: 'short' });
      if (!months[month]) months[month] = { name: month, receita: 0, despesa: 0 };
      months[month].despesa += e.amount;
    });

    return Object.values(months);
  }, [payments, expenses]);

  const handleExport = () => {
    const data = monthlyData.map((d: any) => ({
      Mês: d.name,
      Receita: d.receita,
      Despesa: d.despesa,
      Lucro: d.receita - d.despesa
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Relatórios e Analítica</h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Visão detalhada do desempenho da sua frota</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
            {['week', 'month', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  period === p ? "bg-sidebar text-white shadow-md" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExport}
            className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-400 hover:text-sidebar transition-all"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Receita Total</span>
          </div>
          <p className="text-2xl font-black tracking-tighter">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-gray-400 font-bold mt-1">+12.5% vs mês anterior</p>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Despesas</span>
          </div>
          <p className="text-2xl font-black tracking-tighter">{formatCurrency(stats.totalExpenses)}</p>
          <p className="text-xs text-gray-400 font-bold mt-1">-2.4% vs mês anterior</p>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-sidebar/5 text-sidebar rounded-2xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-sidebar uppercase tracking-widest">Lucro Líquido</span>
          </div>
          <p className="text-2xl font-black tracking-tighter">{formatCurrency(stats.totalNet)}</p>
          <p className="text-xs text-gray-400 font-bold mt-1">+18.2% vs mês anterior</p>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Margem Operac.</span>
          </div>
          <p className="text-2xl font-black tracking-tighter">{stats.margin.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 font-bold mt-1">Meta: 25%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black tracking-tighter uppercase mb-8">Evolução Mensal</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />
                <Bar dataKey="receita" name="Receita" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black tracking-tighter uppercase mb-8">Distribuição por Plataforma</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByPlatform}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueByPlatform.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fleet Performance Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tighter uppercase">Desempenho por Viatura</h3>
          <button className="text-xs font-black text-sidebar uppercase tracking-widest hover:underline">Ver Todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Viatura</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Motorista</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Receita</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Despesa</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Eficiência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vehicles.slice(0, 5).map((v) => {
                const driver = drivers.find(d => d.id === v.current_driver_id);
                const revenue = earningImports.filter(e => e.driver_id === driver?.id).reduce((acc, e) => acc + e.amount, 0);
                const expense = expenses.filter(e => e.driver_id === driver?.id).reduce((acc, e) => acc + e.amount, 0);
                const efficiency = revenue > 0 ? ((revenue - expense) / revenue) * 100 : 0;

                return (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-xl">
                          <Car className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-black tracking-tighter">{v.plate}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{v.brand} {v.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-bold text-gray-600">{driver?.full_name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-black">{formatCurrency(revenue)}</td>
                    <td className="px-8 py-6 text-sm font-black text-red-500">{formatCurrency(expense)}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              efficiency > 30 ? "bg-emerald-500" : efficiency > 15 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${Math.min(100, Math.max(0, efficiency))}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black">{efficiency.toFixed(0)}%</span>
                      </div>
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
