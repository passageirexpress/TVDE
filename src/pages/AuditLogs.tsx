import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Calendar, 
  ArrowRight,
  Shield,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { cn } from '../lib/utils';
import { AuditLog } from '../types';

export default function AuditLogs() {
  const { auditLogs } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           log.user_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      return matchesSearch && matchesAction;
    });
  }, [auditLogs, searchTerm, filterAction]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'UPDATE': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'DELETE': return 'bg-red-50 text-red-600 border-red-100';
      case 'LOGIN': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Registos de Auditoria</h1>
          <p className="text-gray-500 mt-1 font-medium">Histórico completo de ações realizadas no sistema.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 text-xs font-bold uppercase tracking-widest">
          <Shield className="w-4 h-4" />
          Segurança Ativa
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {['all', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'].map((a) => (
                <button 
                  key={a}
                  onClick={() => setFilterAction(a)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", 
                    filterAction === a ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {a === 'all' ? 'Todos' : a}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Procurar ação ou usuário..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-sidebar/10 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Data / Hora</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Usuário</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Ação</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Entidade</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">
                        {new Date(log.timestamp).toLocaleString('pt-PT')}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                        {log.user_name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{log.user_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      getActionColor(log.action)
                    )}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-lg">
                      {log.entity}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-medium text-gray-600">{log.details}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-600 rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Retenção de Dados</h3>
            <p className="text-white/70 text-sm">Os registos de auditoria são mantidos por um período de 12 meses para fins de conformidade.</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-50 transition-all">
          Exportar Logs (CSV)
        </button>
      </div>
    </div>
  );
}
