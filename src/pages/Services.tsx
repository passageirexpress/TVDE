import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Truck, 
  ChevronRight, 
  CheckCircle2, 
  Clock as ClockIcon, 
  AlertCircle,
  X,
  Plane,
  Package,
  Euro
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, cn } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';
import { Transfer, Delivery } from '../types';
import { fetchFlightStatus } from '../services/flightService';

export default function Services() {
  const user = useAuthStore(state => state.user);
  const { transfers, deliveries, addTransfer, addDelivery, updateTransfer, drivers, clients } = useDataStore();
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'transfer' | 'delivery'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingFlight, setLoadingFlight] = useState<string | null>(null);

  const checkFlight = async (flightNumber: string, transferId: string) => {
    setLoadingFlight(transferId);
    try {
      const info = await fetchFlightStatus(flightNumber);
      updateTransfer(transferId, { 
        flight_status: info.status,
        estimated_arrival: info.estimated_arrival 
      });
      toast.info(`Voo ${flightNumber}: ${info.status.replace('_', ' ')}`);
    } catch (error) {
      toast.error('Erro ao verificar voo');
    } finally {
      setLoadingFlight(null);
    }
  };

  const [formData, setFormData] = useState<any>({
    type: 'transfer',
    status: 'scheduled',
    scheduled_at: new Date().toISOString().slice(0, 16),
    pickup_location: '',
    dropoff_location: '',
    price: 0,
    passengers: 1,
    priority: 'normal'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const commonData = {
      id: crypto.randomUUID(),
      company_id: user?.company_id || '',
      pickup_location: formData.pickup_location,
      dropoff_location: formData.dropoff_location,
      scheduled_at: formData.scheduled_at,
      price: formData.price,
      status: formData.status,
      driver_id: formData.driver_id,
      client_id: formData.client_id,
      created_at: new Date().toISOString()
    };

    if (formData.type === 'transfer') {
      const transfer: Transfer = {
        ...commonData,
        flight_number: formData.flight_number,
        passengers: formData.passengers || 1,
      } as Transfer;
      addTransfer(transfer);
    } else {
      const delivery: Delivery = {
        ...commonData,
        package_description: formData.package_description,
        priority: formData.priority || 'normal',
      } as Delivery;
      addDelivery(delivery);
    }

    toast.success('Serviço agendado com sucesso!');
    setShowModal(false);
  };

  const allServices = [
    ...transfers.map(t => ({ ...t, type: 'transfer' as const })),
    ...deliveries.map(d => ({ ...d, type: 'delivery' as const }))
  ].sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  const filteredServices = allServices.filter(s => {
    const matchesType = filterType === 'all' || s.type === filterType;
    const matchesSearch = s.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.dropoff_location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'scheduled': return <ClockIcon className="w-4 h-4 text-amber-500" />;
      case 'in_progress': return <ClockIcon className="w-4 h-4 text-blue-500 animate-pulse" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Serviços & Logística</h1>
          <p className="text-gray-500 mt-1 font-medium">Gestão de Transfers, Entregas e Serviços Privados.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-sidebar text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20"
        >
          <Plus className="w-5 h-5" />
          Agendar Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Transfers</h3>
          </div>
          <p className="text-2xl font-black">{transfers.length}</p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Agendados</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900">Entregas</h3>
          </div>
          <p className="text-2xl font-black">{deliveries.length}</p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Em curso</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Euro className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-900">Faturação Direta</h3>
          </div>
          <p className="text-2xl font-black">{formatCurrency(allServices.reduce((acc, s) => acc + s.price, 0))}</p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Total Previsto</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setFilterType('all')}
                className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", filterType === 'all' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilterType('transfer')}
                className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", filterType === 'transfer' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
              >
                Transfers
              </button>
              <button 
                onClick={() => setFilterType('delivery')}
                className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", filterType === 'delivery' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
              >
                Entregas
              </button>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Procurar local..."
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
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Serviço / Data</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Trajeto</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Atribuído</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Valor</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredServices.map(service => (
                <tr key={service.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-xl",
                        service.type === 'transfer' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {service.type === 'transfer' ? <Plane className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">
                          {service.type === 'transfer' ? `Transfer ${service.flight_number || ''}` : 'Entrega Encomenda'}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                          {new Date(service.scheduled_at).toLocaleString('pt-PT')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {service.pickup_location}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                        {service.dropoff_location}
                      </div>
                      {service.type === 'transfer' && (service as Transfer).flight_number && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className={cn(
                            "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                            (service as Transfer).flight_status === 'on_time' ? "bg-emerald-50 text-emerald-600" :
                            (service as Transfer).flight_status === 'delayed' ? "bg-amber-50 text-amber-600" :
                            "bg-blue-50 text-blue-600"
                          )}>
                            {(service as Transfer).flight_status?.replace('_', ' ') || 'Voo: ' + (service as Transfer).flight_number}
                          </span>
                          <button 
                            onClick={() => checkFlight((service as Transfer).flight_number!, service.id)}
                            disabled={loadingFlight === service.id}
                            className="text-[9px] font-black text-sidebar hover:text-black uppercase tracking-widest disabled:opacity-50"
                          >
                            {loadingFlight === service.id ? '...' : 'Check'}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {service.driver_id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                          {drivers.find(d => d.id === service.driver_id)?.full_name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-gray-700">
                          {drivers.find(d => d.id === service.driver_id)?.full_name.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg">Não Atribuído</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-gray-900">{formatCurrency(service.price)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {service.status === 'scheduled' ? 'Agendado' : service.status === 'in_progress' ? 'Em Curso' : 'Concluído'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-gray-400 hover:text-sidebar transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Novo Agendamento</h2>
                <p className="text-sm text-gray-500 font-medium">Configure um novo serviço de Transfer ou Entrega</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'transfer'})}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                    formData.type === 'transfer' ? "border-sidebar bg-sidebar/5 text-sidebar" : "border-gray-100 hover:border-gray-200 text-gray-400"
                  )}
                >
                  <Plane className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase">Transfer</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'delivery'})}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                    formData.type === 'delivery' ? "border-sidebar bg-sidebar/5 text-sidebar" : "border-gray-100 hover:border-gray-200 text-gray-400"
                  )}
                >
                  <Package className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase">Entrega</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cliente</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.client_id || ''}
                    onChange={e => setFormData({...formData, client_id: e.target.value})}
                  >
                    <option value="">Selecione o Cliente</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data & Hora</label>
                  <input 
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.scheduled_at}
                    onChange={e => setFormData({...formData, scheduled_at: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recolha (Pickup)</label>
                  <input 
                    placeholder="Ex: Aeroporto de Lisboa"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.pickup_location}
                    onChange={e => setFormData({...formData, pickup_location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Destino (Dropoff)</label>
                  <input 
                    placeholder="Ex: Hotel Tivoli Avenida"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.dropoff_location}
                    onChange={e => setFormData({...formData, dropoff_location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preço (EUR)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Motorista</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.driver_id || ''}
                    onChange={e => setFormData({...formData, driver_id: e.target.value})}
                  >
                    <option value="">Atribuição Manual</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.type === 'transfer' && (
                <div className="grid grid-cols-2 gap-6 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-blue-600 uppercase tracking-widest">Nº do Voo</label>
                    <input 
                      placeholder="Ex: TP1234"
                      className="w-full px-4 py-3 bg-white border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500/10 outline-none font-medium"
                      value={formData.flight_number || ''}
                      onChange={e => setFormData({...formData, flight_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-blue-600 uppercase tracking-widest">Passageiros</label>
                    <input 
                      type="number"
                      className="w-full px-4 py-3 bg-white border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500/10 outline-none font-medium"
                      value={formData.passengers}
                      onChange={e => setFormData({...formData, passengers: Number(e.target.value)})}
                    />
                  </div>
                </div>
              )}

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
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
