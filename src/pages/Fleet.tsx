import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Wrench,
  Fuel,
  Calendar,
  History,
  ChevronDown,
  ChevronUp,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '../store/useDataStore';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';

export default function Fleet() {
  const { vehicles, deleteVehicle } = useDataStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || v.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Ativo</span>;
      case 'maintenance':
        return <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-100 flex items-center gap-1 w-fit"><Wrench className="w-3 h-3" /> Manutenção</span>;
      case 'inactive':
        return <span className="bg-gray-50 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-gray-100 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Inativo</span>;
      default:
        return null;
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar este veículo? Esta ação não pode ser revertida.')) {
      try {
        deleteVehicle(id);
        toast.success('Veículo eliminado com sucesso!');
      } catch (error: any) {
        toast.error('Erro ao eliminar veículo: ' + error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão da Frota</h1>
          <p className="text-gray-500 mt-1">Controle total sobre os veículos, manutenção e documentação.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/vehicles')}
          className="bg-sidebar text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10"
        >
          <Plus className="w-5 h-5" />
          Novo Veículo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <Car className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Total da Frota</span>
          </div>
          <h3 className="text-3xl font-bold">{vehicles.length}</h3>
          <p className="text-xs text-gray-400 mt-2">Veículos cadastrados</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-3 text-emerald-700 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Em Operação</span>
          </div>
          <h3 className="text-3xl font-bold text-emerald-900">{vehicles.filter(v => v.status === 'active').length}</h3>
          <p className="text-xs text-emerald-700 mt-2">Gerando receita</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
          <div className="flex items-center gap-3 text-amber-700 mb-2">
            <Wrench className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Em Manutenção</span>
          </div>
          <h3 className="text-3xl font-bold text-amber-900">{vehicles.filter(v => v.status === 'maintenance').length}</h3>
          <p className="text-xs text-amber-700 mt-2">Aguardando reparo</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por matrícula, marca ou modelo..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sidebar/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 mr-2" />
            {['all', 'active', 'maintenance', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                  filterStatus === status 
                    ? "bg-sidebar text-white shadow-md shadow-sidebar/20" 
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                )}
              >
                {status === 'all' ? 'Todos' : status === 'active' ? 'Ativos' : status === 'maintenance' ? 'Manutenção' : 'Inativos'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Veículo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Matrícula</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Próxima Inspeção</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Consumo Médio</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredVehicles.map((vehicle) => (
                <React.Fragment key={vehicle.id}>
                  <tr className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-sidebar group-hover:text-white transition-colors">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{vehicle.brand} {vehicle.model}</p>
                          <p className="text-xs text-gray-400">{vehicle.year} • {vehicle.color}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded font-mono text-xs font-bold text-gray-700">
                        {vehicle.plate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {vehicle.inspection_expiry}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Fuel className="w-4 h-4 text-gray-400" />
                        5.4 L/100km
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setExpandedHistoryId(expandedHistoryId === vehicle.id ? null : vehicle.id)}
                          className={cn(
                            "p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold",
                            expandedHistoryId === vehicle.id 
                              ? "bg-sidebar text-white" 
                              : "text-gray-400 hover:text-sidebar hover:bg-gray-100"
                          )}
                          title="Ver Histórico de Aluguer"
                        >
                          <History className="w-4 h-4" />
                          {expandedHistoryId === vehicle.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-sidebar rounded-lg hover:bg-gray-100 transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(vehicle.id)}
                          className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedHistoryId === vehicle.id && (
                    <tr className="bg-gray-50/50 animate-in fade-in slide-in-from-top-2">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <History className="w-4 h-4 text-sidebar" />
                            <h4 className="text-sm font-bold text-gray-900">Histórico de Aluguer</h4>
                          </div>
                          {vehicle.rental_history && vehicle.rental_history.length > 0 ? (
                            <div className="space-y-3">
                              {vehicle.rental_history.map((history, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-100">
                                      {history.driver_name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-gray-900">{history.driver_name}</p>
                                      <p className="text-[10px] text-gray-400 uppercase font-bold">Motorista</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-8">
                                    <div className="text-right">
                                      <p className="text-xs font-bold text-gray-700">{history.start_date}</p>
                                      <p className="text-[10px] text-gray-400 uppercase font-bold">Início</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-bold text-gray-700">{history.end_date}</p>
                                      <p className="text-[10px] text-gray-400 uppercase font-bold">Fim</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-400">
                              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                              <p className="text-xs font-medium">Nenhum histórico de aluguer registado para este veículo.</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
