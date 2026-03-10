import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Euro, 
  TrendingUp, 
  Link as LinkIcon, 
  Copy,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Building2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '../store/useDataStore';
import { Affiliate } from '../types';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';

export default function AffiliatesPage() {
  const { companies, affiliates, addAffiliate, updateAffiliate, deleteAffiliate } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAffiliates = affiliates.filter(a => {
    const referrer = companies.find(c => c.id === a.referrer_company_id);
    const referred = companies.find(c => c.id === a.referred_company_id);
    const matchesSearch = referrer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         referred?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusLabel = (status: Affiliate['status']) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'active': return 'Ativo';
      case 'paid': return 'Pago';
      default: return status;
    }
  };

  const getStatusColor = (status: Affiliate['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'active': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar este afiliado? Esta ação não pode ser revertida.')) {
      try {
        deleteAffiliate(id);
        toast.success('Afiliado eliminado com sucesso!');
      } catch (error: any) {
        toast.error('Erro ao eliminar afiliado: ' + error.message);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">AFILIADOS</h1>
          <p className="text-gray-500 mt-1 font-medium">Gestão de recomendações e comissões master</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => copyToClipboard('https://tvdefleet.com/register?ref=MASTER')}
            className="bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all"
          >
            <LinkIcon className="w-5 h-5" />
            Link Geral
          </button>
          <button className="bg-sidebar text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20">
            <Plus className="w-5 h-5" />
            Novo Afiliado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Users className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold">+12%</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Total Afiliados</p>
          <h3 className="text-4xl font-black mt-2">156</h3>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Euro className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold">+8%</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Comissões Pagas</p>
          <h3 className="text-4xl font-black mt-2">{formatCurrency(4850.00)}</h3>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock className="w-8 h-8" />
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Aguardando Pagamento</p>
          <h3 className="text-4xl font-black mt-2">{formatCurrency(1240.50)}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Procurar por empresa..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-sidebar/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Referente (Quem indicou)</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Referido (Nova Empresa)</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Data</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Comissão</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAffiliates.length > 0 ? (
                filteredAffiliates.map((a) => {
                  const referrer = companies.find(c => c.id === a.referrer_company_id);
                  const referred = companies.find(c => c.id === a.referred_company_id);
                  
                  return (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                            {referrer?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{referrer?.name}</p>
                            <p className="text-xs text-gray-500">ID: {referrer?.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center font-bold">
                            {referred?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{referred?.name}</p>
                            <p className="text-xs text-gray-500">Plano: {referred?.plan.toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {new Date(a.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(a.commission_amount)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                          getStatusColor(a.status)
                        )}>
                          {getStatusLabel(a.status)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-sidebar hover:bg-gray-100 rounded-lg transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(a.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-gray-400 italic">
                    Nenhum registo de afiliação encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
