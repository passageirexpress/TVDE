import React, { useState } from 'react';
import { 
  Fuel, 
  Plus, 
  Search, 
  Calendar, 
  Car, 
  User, 
  Euro, 
  MapPin, 
  FileText, 
  X, 
  ChevronRight,
  Droplets,
  Zap,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, cn } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';
import { FuelLog } from '../types';

export default function FuelLogs() {
  const user = useAuthStore(state => state.user);
  const { fuelLogs, addFuelLog, deleteFuelLog, vehicles, drivers } = useDataStore();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<FuelLog>>({
    date: new Date().toISOString().slice(0, 16),
    odometer: 0,
    liters_or_kwh: 0,
    total_cost: 0,
    location: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicle_id || !formData.driver_id) {
      toast.error('Selecione o veículo e o motorista');
      return;
    }

    const log: FuelLog = {
      id: crypto.randomUUID(),
      company_id: user?.company_id || '',
      ...formData as any,
      created_at: new Date().toISOString()
    };
    addFuelLog(log);
    toast.success('Abastecimento registado!');
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar este registo de abastecimento?')) {
      try {
        await deleteFuelLog(id);
        toast.success('Registo eliminado com sucesso!');
      } catch (error: any) {
        toast.error('Erro ao eliminar registo: ' + error.message);
      }
    }
  };

  const filteredLogs = fuelLogs.filter(log => {
    const vehicle = vehicles.find(v => v.id === log.vehicle_id);
    const driver = drivers.find(d => d.id === log.driver_id);
    const searchStr = `${vehicle?.plate} ${driver?.full_name} ${log.location}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Abastecimentos</h1>
          <p className="text-gray-500 mt-1 font-medium">Controlo de combustível e carregamentos elétricos.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-sidebar text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20"
        >
          <Plus className="w-5 h-5" />
          Registar Abastecimento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Euro className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-900">Gasto Total</h3>
          </div>
          <p className="text-2xl font-black">{formatCurrency(fuelLogs.reduce((acc, l) => acc + l.total_cost, 0))}</p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Este Mês</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Droplets className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Volume Total</h3>
          </div>
          <p className="text-2xl font-black">{fuelLogs.reduce((acc, l) => acc + l.liters_or_kwh, 0).toFixed(1)} L/kWh</p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Consumo Acumulado</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Fuel className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900">Média de Preço</h3>
          </div>
          <p className="text-2xl font-black">
            {fuelLogs.length > 0 
              ? formatCurrency(fuelLogs.reduce((acc, l) => acc + l.total_cost, 0) / fuelLogs.reduce((acc, l) => acc + l.liters_or_kwh, 0))
              : '€0.00'
            }
          </p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Por Litro/kWh</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Procurar por matrícula, motorista ou local..."
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
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Data / Veículo</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Motorista</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Odómetro</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Quantidade</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Custo Total</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map(log => {
                const vehicle = vehicles.find(v => v.id === log.vehicle_id);
                const driver = drivers.find(d => d.id === log.driver_id);
                return (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-xl text-gray-600">
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{vehicle?.plate || '---'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                            {new Date(log.date).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-sidebar/10 text-sidebar rounded-full flex items-center justify-center text-[10px] font-bold">
                          {driver?.full_name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-gray-700">{driver?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-600">{log.odometer.toLocaleString()} km</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-3 h-3 text-blue-400" />
                        <p className="text-sm font-bold text-gray-600">{log.liters_or_kwh} L/kWh</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-gray-900">{formatCurrency(log.total_cost)}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toast.info('A abrir comprovativo...')}
                          className="p-2 text-gray-400 hover:text-sidebar hover:bg-gray-100 rounded-lg transition-all"
                          title="Ver Comprovativo"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(log.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Registar Abastecimento</h2>
                <p className="text-sm text-gray-500 font-medium">Controlo de custos de combustível/energia</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Veículo</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.vehicle_id || ''}
                    onChange={e => setFormData({...formData, vehicle_id: e.target.value})}
                  >
                    <option value="">Selecione</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.plate} - {v.brand}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Motorista</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.driver_id || ''}
                    onChange={e => setFormData({...formData, driver_id: e.target.value})}
                  >
                    <option value="">Selecione</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data & Hora</label>
                  <input 
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Odómetro (km)</label>
                  <input 
                    type="number"
                    required
                    placeholder="Ex: 125400"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.odometer}
                    onChange={e => setFormData({...formData, odometer: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Qtd (L ou kWh)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 45.5"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.liters_or_kwh}
                    onChange={e => setFormData({...formData, liters_or_kwh: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Custo Total (€)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 85.20"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.total_cost}
                    onChange={e => setFormData({...formData, total_cost: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Local / Posto</label>
                <input 
                  placeholder="Ex: Galp Aeroporto"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-sidebar text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-sidebar/20"
                >
                  Registar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
