import React, { useState } from 'react';
import { Search, Building2, CreditCard, CheckCircle2, XCircle, Clock, MoreHorizontal, Filter } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useDataStore } from '../store/useDataStore';
import { Company } from '../types';

export default function MasterSubscriptions() {
  const { companies, updateCompany } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'trial'>('all');

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (c.nif || '').includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || c.subscription_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdatePlan = (companyId: string, plan: string) => {
    updateCompany(companyId, { plan: plan as any, subscription_status: 'active' });
    alert('Plano atualizado com sucesso!');
  };

  const handleUpdateStatus = (companyId: string, status: string) => {
    updateCompany(companyId, { subscription_status: status as any });
    alert('Status da assinatura atualizado!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Assinaturas</h1>
          <p className="text-gray-500 mt-1">Controle os planos e pagamentos de todas as empresas do SaaS.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total de Assinaturas</p>
          <h3 className="text-2xl font-bold mt-1">{companies.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Assinaturas Ativas</p>
          <h3 className="text-2xl font-bold mt-1 text-emerald-600">
            {companies.filter(c => c.subscription_status === 'active').length}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Receita Mensal Estimada (MRR)</p>
          <h3 className="text-2xl font-bold mt-1 text-indigo-600">
            {formatCurrency(companies.reduce((acc, c) => {
              if (c.plan === 'pro') return acc + 49.90;
              if (c.plan === 'enterprise') return acc + 99.90;
              return acc;
            }, 0))}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por empresa ou NIF..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sidebar/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativas</option>
              <option value="expired">Expiradas</option>
              <option value="trial">Trial</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase tracking-widest">Empresa</th>
                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase tracking-widest">Plano Atual</th>
                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase tracking-widest">Último Pagamento</th>
                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-sidebar/10 rounded-full flex items-center justify-center text-sidebar font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{company.name}</p>
                        <p className="text-[10px] text-gray-400">{company.nif}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="text-sm font-bold bg-transparent border-none focus:ring-0 cursor-pointer"
                      value={company.plan || 'free'}
                      onChange={(e) => handleUpdatePlan(company.id, e.target.value)}
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {company.subscription_status === 'active' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : company.subscription_status === 'expired' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                      <select 
                        className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full border",
                          company.subscription_status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          company.subscription_status === 'expired' ? "bg-red-50 text-red-700 border-red-100" :
                          "bg-amber-50 text-amber-700 border-amber-100"
                        )}
                        value={company.subscription_status || 'active'}
                        onChange={(e) => handleUpdateStatus(company.id, e.target.value)}
                      >
                        <option value="active">Ativa</option>
                        <option value="expired">Expirada</option>
                        <option value="trial">Trial</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {company.last_payment_date ? new Date(company.last_payment_date).toLocaleDateString() : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-sidebar rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
