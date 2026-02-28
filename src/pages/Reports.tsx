import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Car, 
  Euro, 
  Download, 
  Calendar,
  ChevronRight,
  FileText,
  Filter
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
  Cell,
  PieChart as RePieChart,
  Pie,
  Legend
} from 'recharts';

const revenueData = [
  { name: 'Seg', total: 1200, uber: 800, bolt: 400 },
  { name: 'Ter', total: 1400, uber: 900, bolt: 500 },
  { name: 'Qua', total: 1100, uber: 700, bolt: 400 },
  { name: 'Qui', total: 1600, uber: 1100, bolt: 500 },
  { name: 'Sex', total: 2100, uber: 1400, bolt: 700 },
  { name: 'Sáb', total: 2400, uber: 1600, bolt: 800 },
  { name: 'Dom', total: 1800, uber: 1200, bolt: 600 },
];

const commissionDistribution = [
  { name: 'Uber', value: 7700 * 0.25 },
  { name: 'Bolt', value: 3900 * 0.25 },
];

const COLORS = ['#6366f1', '#10b981'];

const driverPerformance = [
  { name: 'João Silva', revenue: 850, rating: 4.9, acceptance: 94 },
  { name: 'Maria Santos', revenue: 920, rating: 4.8, acceptance: 88 },
  { name: 'Ana Oliveira', revenue: 780, rating: 4.7, acceptance: 91 },
  { name: 'Pedro Costa', revenue: 650, rating: 4.6, acceptance: 85 },
];

export default function Reports() {
  const [activeReport, setActiveReport] = useState('revenue');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Relatórios & BI</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Análise profunda de faturamento, desempenho e métricas da frota.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => alert('Filtrando dados...')}
            className="bg-white text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-sm sm:text-base"
          >
            <Filter className="w-4 h-4 sm:w-5 h-5" />
            Período
          </button>
          <button 
            onClick={() => alert('Gerando PDF consolidado...')}
            className="bg-sidebar text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 text-sm sm:text-base"
          >
            <Download className="w-4 h-4 sm:w-5 h-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-4 p-1 bg-gray-100 rounded-2xl w-full sm:w-fit overflow-x-auto scrollbar-hide">
        {[
          { id: 'revenue', label: 'Faturamento', icon: Euro },
          { id: 'performance', label: 'Desempenho', icon: TrendingUp },
          { id: 'fleet', label: 'Frota', icon: Car },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveReport(tab.id);
              alert(`Carregando relatório de ${tab.label}...`);
            }}
            className={cn(
              "px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap",
              activeReport === tab.id ? "bg-white text-sidebar shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="mb-8">
              <h3 className="text-lg font-bold">Faturamento Semanal por Plataforma</h3>
              <p className="text-xs text-gray-400 mt-1">Período: {getUberPeriod(new Date(), -1)}</p>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="uber" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="bolt" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-8">Distribuição de Comissões por Plataforma</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={commissionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {commissionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6">Top Motoristas (Receita)</h3>
            <div className="space-y-4">
              {driverPerformance.map((driver, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-sidebar/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-sidebar shadow-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold">{driver.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Rating: {driver.rating} ★</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Aceitação: {driver.acceptance}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-600">{formatCurrency(driver.revenue)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Esta Semana</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-sidebar p-8 rounded-3xl shadow-xl text-white">
            <h3 className="text-lg font-bold mb-6">Resumo Executivo</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sidebar-foreground text-xs font-bold uppercase tracking-widest">Receita Total</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(11600.00)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sidebar-foreground text-[10px] font-bold uppercase tracking-widest">Uber</p>
                  <p className="text-xl font-bold">{formatCurrency(7700.00)}</p>
                </div>
                <div>
                  <p className="text-sidebar-foreground text-[10px] font-bold uppercase tracking-widest">Bolt</p>
                  <p className="text-xl font-bold">{formatCurrency(3900.00)}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-sidebar-foreground text-xs font-bold uppercase tracking-widest">Comissão Estimada</p>
                <p className="text-2xl font-bold mt-1 text-emerald-400">{formatCurrency(2900.00)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Métricas de Qualidade</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500">Rating Médio</span>
                  <span className="text-sm font-bold text-sidebar">4.82/5.0</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-sidebar w-[96%]"></div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500">Taxa de Aceitação</span>
                  <span className="text-sm font-bold text-emerald-600">91.4%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[91%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
