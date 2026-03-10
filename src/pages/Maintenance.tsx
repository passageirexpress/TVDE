import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Euro, 
  Gauge, 
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  History,
  Car,
  X
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { Maintenance } from '../types';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function MaintenancePage() {
  const { vehicles, maintenances, addMaintenance, updateMaintenance, deleteMaintenance } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');

  const stats = useMemo(() => {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const scheduled = maintenances.filter(m => {
      const mDate = new Date(m.date);
      return m.status === 'scheduled' && mDate >= today && mDate <= next30Days;
    }).length;

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const totalCost = maintenances.filter(m => {
      const mDate = new Date(m.date);
      return mDate.getMonth() === currentMonth && mDate.getFullYear() === currentYear;
    }).reduce((acc, m) => acc + m.cost, 0);

    const delayed = maintenances.filter(m => {
      const mDate = new Date(m.date);
      return m.status === 'scheduled' && mDate < today;
    }).length;

    return { scheduled, totalCost, delayed };
  }, [maintenances]);

  const filteredMaintenances = maintenances.filter(m => {
    const vehicle = vehicles.find(v => v.id === m.vehicle_id);
    const matchesSearch = vehicle?.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = selectedVehicleId === 'all' || m.vehicle_id === selectedVehicleId;
    return matchesSearch && matchesVehicle;
  });

  const getMaintenanceTypeLabel = (type: Maintenance['type']) => {
    switch (type) {
      case 'oil_change': return 'Mudança de Óleo';
      case 'tires': return 'Pneus';
      case 'brakes': return 'Travões';
      case 'general': return 'Geral';
      default: return 'Outro';
    }
  };

  const getMaintenanceTypeColor = (type: Maintenance['type']) => {
    switch (type) {
      case 'oil_change': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'tires': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'brakes': return 'bg-red-50 text-red-700 border-red-100';
      case 'general': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">MANUTENÇÃO</h1>
          <p className="text-gray-500 mt-1 font-medium">Controlo de revisões e histórico da frota</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-sidebar text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20"
        >
          <Plus className="w-5 h-5" />
          Nova Revisão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-600">Próximos 30 dias</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Revisões Agendadas</p>
          <h3 className="text-2xl font-bold mt-1">{stats.scheduled} Veículos</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Euro className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600">Este Mês</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Custo Total Manutenção</p>
          <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.totalCost)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-red-600">Crítico</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Manutenção em Atraso</p>
          <h3 className="text-2xl font-bold mt-1">{stats.delayed} Veículos</h3>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Procurar por matrícula ou descrição..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-sidebar/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <select 
                className="bg-gray-50 border-none rounded-2xl text-sm px-4 py-3 focus:ring-2 focus:ring-sidebar/20 outline-none"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                <option value="all">Todos os Veículos</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>
                ))}
              </select>
              <button className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Veículo</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Tipo</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Data</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">KM</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Custo</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMaintenances.length > 0 ? (
                filteredMaintenances.map((m) => {
                  const vehicle = vehicles.find(v => v.id === m.vehicle_id);
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                            <Car className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{vehicle?.plate}</p>
                            <p className="text-xs text-gray-500">{vehicle?.brand} {vehicle?.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                          getMaintenanceTypeColor(m.type)
                        )}>
                          {getMaintenanceTypeLabel(m.type)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {m.date}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Gauge className="w-4 h-4 text-gray-400" />
                          {m.mileage.toLocaleString()} km
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(m.cost)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-600 uppercase">Concluído</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              if (confirm('Tem a certeza que deseja eliminar este registo? Esta ação não pode ser revertida.')) {
                                try {
                                  deleteMaintenance(m.id);
                                  toast.success('Registo eliminado com sucesso!');
                                } catch (error: any) {
                                  toast.error('Erro ao eliminar registo: ' + error.message);
                                }
                              }
                            }}
                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Eliminar Manutenção"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-sidebar hover:bg-gray-100 rounded-lg transition-all">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-gray-400 italic">
                    Nenhum registo de manutenção encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Nova Revisão</h2>
                <p className="text-sm text-gray-500 font-medium">Registe uma nova manutenção para um veículo da frota</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const maintenance: Maintenance = {
                  id: crypto.randomUUID(),
                  vehicle_id: formData.get('vehicle_id') as string,
                  type: formData.get('type') as Maintenance['type'],
                  date: formData.get('date') as string,
                  mileage: parseInt(formData.get('mileage') as string),
                  cost: parseFloat(formData.get('cost') as string),
                  description: formData.get('description') as string,
                  status: 'completed',
                  created_at: new Date().toISOString()
                };
                addMaintenance(maintenance);
                setShowAddModal(false);
                toast.success('Manutenção registada com sucesso!');
              }}
              className="p-8 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Veículo</label>
                  <select 
                    name="vehicle_id"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                  >
                    <option value="">Selecione o Veículo</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo de Manutenção</label>
                  <select 
                    name="type"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                  >
                    <option value="oil_change">Mudança de Óleo</option>
                    <option value="tires">Pneus</option>
                    <option value="brakes">Travões</option>
                    <option value="general">Geral</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data</label>
                  <input 
                    name="date"
                    required type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quilometragem</label>
                  <input 
                    name="mileage"
                    required type="number"
                    placeholder="Ex: 125000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Custo (€)</label>
                  <input 
                    name="cost"
                    required type="number" step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descrição</label>
                <textarea 
                  name="description"
                  required
                  rows={3}
                  placeholder="Detalhes da manutenção realizada..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium resize-none"
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-sidebar text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-sidebar/20 flex items-center justify-center"
                >
                  Registar Manutenção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
