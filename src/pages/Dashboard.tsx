import React from 'react';
import { 
  Users, 
  Car, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Euro
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
  const { drivers, vehicles, payments, expenses } = useDataStore();

  const activeDriversCount = drivers.filter(d => d.status === 'active').length;
  const activeVehiclesCount = vehicles.filter(v => v.status === 'active').length;
  
  const totalGrossRevenue = payments.reduce((acc, p) => acc + p.gross, 0);
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

  const pendingPaymentsTotal = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.net, 0);

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
      
      if (diffInsurance <= 7) {
        return {
          title: 'Seguro a Vencer',
          message: `O seguro da viatura ${v.plate} vence em ${diffInsurance} dias.`,
          type: 'red'
        };
      }
      return {
        title: 'Inspeção a Vencer',
        message: `A inspeção da viatura ${v.plate} vence em ${diffInspection} dias.`,
        type: 'amber'
      };
    });

  const chartData = [
    { name: 'Jan', revenue: 4500, uber: 3000, bolt: 1500 },
    { name: 'Fev', revenue: 5200, uber: 3200, bolt: 2000 },
    { name: 'Mar', revenue: 4800, uber: 2800, bolt: 2000 },
    { name: 'Abr', revenue: 6100, uber: 4000, bolt: 2100 },
    { name: 'Mai', revenue: 5900, uber: 3800, bolt: 2100 },
    { name: 'Jun', revenue: totalGrossRevenue, uber: totalGrossRevenue * 0.6, bolt: totalGrossRevenue * 0.4 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bem-vindo de volta ao seu painel de gestão de frota.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Motoristas Ativos" 
          value={activeDriversCount.toString()} 
          icon={Users} 
          trend="up" 
          trendValue="+12%" 
          link="/drivers"
        />
        <StatCard 
          title="Veículos em Operação" 
          value={activeVehiclesCount.toString()} 
          icon={Car} 
          link="/vehicles"
        />
        <StatCard 
          title="Receita Bruta" 
          value={formatCurrency(totalGrossRevenue)} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="+8.4%" 
          link="/finance"
        />
        <StatCard 
          title="IVA Estimado (6%)" 
          value={formatCurrency(totalIVA)} 
          icon={AlertCircle} 
          link="/finance"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <h3 className="text-lg font-bold">Desempenho de Faturamento</h3>
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
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBolt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="uber" stroke="#6366f1" fillOpacity={1} fill="url(#colorUber)" strokeWidth={3} />
                <Area type="monotone" dataKey="bolt" stroke="#10b981" fillOpacity={1} fill="url(#colorBolt)" strokeWidth={3} />
              </AreaChart>
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
                    onClick={() => alert('Redirecionando para detalhes do veículo...')}
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

          <Link to="/finance" className="bg-sidebar p-6 rounded-2xl shadow-lg text-white block hover:bg-black transition-all">
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
    </div>
  );
}
