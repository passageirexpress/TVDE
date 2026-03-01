import React, { useState } from 'react';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Euro, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Key,
  ChevronRight,
  Edit2,
  Save
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';
import { Rental, Vehicle } from '../types';
import { useDataStore } from '../store/useDataStore';

export default function Rentals() {
  const user = useAuthStore(state => state.user);
  const { rentals, addRental, updateRental, approveRental, rejectRental, vehicles, drivers } = useDataStore();
  const [showModal, setShowModal] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [formData, setFormData] = useState<Partial<Rental>>({
    status: 'available',
    daily_rate: 35.00,
    security_deposit: 500.00,
    vehicle_id: ''
  });

  const handleOpenModal = (rental?: Rental) => {
    if (rental) {
      setEditingRental(rental);
      setFormData({
        vehicle_id: rental.vehicle_id,
        daily_rate: rental.daily_rate,
        security_deposit: rental.security_deposit || 500.00,
        status: rental.status
      });
    } else {
      setEditingRental(null);
      setFormData({
        status: 'available',
        daily_rate: 35.00,
        security_deposit: 500.00,
        vehicle_id: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicle_id || !formData.daily_rate) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (editingRental) {
      updateRental(editingRental.id, formData);
      alert('Aluguel atualizado com sucesso!');
    } else {
      const rental: Rental = {
        id: Math.random().toString(36).substr(2, 9),
        vehicle_id: formData.vehicle_id || '',
        daily_rate: Number(formData.daily_rate),
        security_deposit: Number(formData.security_deposit),
        status: 'available'
      };
      addRental(rental);
      alert('Veículo disponibilizado para aluguel com sucesso!');
    }
    setShowModal(false);
  };

  const handleRent = (rentalId: string) => {
    const rental = rentals.find(r => r.id === rentalId);
    if (rental) {
      const weeklyCost = rental.daily_rate * 7;
      alert(`Pedido de aluguel enviado! Um gasto semanal de ${formatCurrency(weeklyCost)} foi adicionado às suas despesas.`);
      updateRental(rentalId, { 
        status: 'rented', 
        driver_id: user?.id, 
        start_date: new Date().toISOString().split('T')[0] 
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aluguel de Viaturas</h1>
          <p className="text-gray-500 mt-1">
            {user?.role === 'admin' ? 'Gerencie as viaturas disponíveis para aluguel.' : 'Escolha uma viatura para alugar e comece a trabalhar.'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-sidebar text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10"
          >
            <Plus className="w-5 h-5" />
            Disponibilizar Viatura
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rentals.map(rental => {
          const vehicle = vehicles.find(v => v.id === rental.vehicle_id);
          if (!vehicle) return null;

          return (
            <div key={rental.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:border-sidebar/20 transition-all">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${vehicle.plate}/800/600`} 
                  alt={vehicle.model}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleOpenModal(rental)}
                      className="p-2 bg-white/90 backdrop-blur-sm text-gray-600 rounded-full hover:text-sidebar shadow-sm transition-all"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    rental.status === 'available' ? "bg-emerald-500 text-white" : 
                    rental.status === 'rented' ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                  )}>
                    {rental.status === 'available' ? 'Disponível' : rental.status === 'rented' ? 'Alugado' : 'Manutenção'}
                  </span>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-bold">{vehicle.brand} {vehicle.model}</h3>
                    <span className="text-xs font-bold text-gray-400 uppercase">{vehicle.year}</span>
                  </div>
                  <p className="text-sm text-gray-500">Matrícula: <span className="font-mono font-bold text-gray-900">{vehicle.plate}</span></p>
                </div>

                {user?.role === 'admin' && rental.interested_drivers && rental.interested_drivers.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Motoristas Interessados</p>
                    <div className="flex flex-wrap gap-2">
                      {rental.interested_drivers.map(driver => (
                        <span key={driver} className="px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-gray-600">
                          {driver}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Caução</p>
                    <p className="text-sm font-bold mt-1">{formatCurrency(rental.security_deposit || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Semanal</p>
                    <p className="text-sm font-bold mt-1 text-emerald-600">{formatCurrency(rental.daily_rate * 7)}</p>
                  </div>
                </div>

                {rental.status === 'rented' && rental.driver_id && (
                  <div className="bg-emerald-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Alugado para</p>
                    <p className="text-sm font-bold text-emerald-900 mt-1">
                      {drivers.find(d => d.id === rental.driver_id)?.full_name || 'Motorista'}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {rental.status === 'available' ? (
                    <button 
                      onClick={() => handleRent(rental.id)}
                      className="flex-1 py-4 bg-sidebar text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                      <Key className="w-5 h-5" />
                      Alugar Agora
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold cursor-not-allowed"
                    >
                      Indisponível
                    </button>
                  )}
                  <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingRental ? 'Editar Aluguel' : 'Disponibilizar Viatura'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Selecionar Viatura</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={formData.vehicle_id}
                  onChange={e => setFormData({...formData, vehicle_id: e.target.value})}
                  disabled={!!editingRental}
                >
                  <option value="">Selecione uma viatura...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Valor Diário (EUR)</label>
                <input 
                  type="number" step="0.01" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={formData.daily_rate}
                  onChange={e => setFormData({...formData, daily_rate: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Depósito de Segurança (Caução)</label>
                <input 
                  type="number" step="0.01" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={formData.security_deposit}
                  onChange={e => setFormData({...formData, security_deposit: Number(e.target.value)})}
                />
              </div>
              {editingRental && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="available">Disponível</option>
                    <option value="rented">Alugado</option>
                    <option value="maintenance">Manutenção</option>
                  </select>
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-sidebar text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-sidebar/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingRental ? 'Salvar Alterações' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {user?.role === 'admin' && (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50">
            <h3 className="text-lg font-bold">Motoristas Interessados</h3>
            <p className="text-sm text-gray-400 mt-1">Lista de motoristas que solicitaram aluguel de viaturas.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400">Viatura</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400">Motorista</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400">Data Solicitação</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rentals.filter(r => r.interested_drivers && r.interested_drivers.length > 0).map(rental => {
                  const vehicle = vehicles.find(v => v.id === rental.vehicle_id);
                  return rental.interested_drivers?.map((driver, idx) => (
                    <tr key={`${rental.id}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold">{vehicle?.brand} {vehicle?.model}</p>
                        <p className="text-xs text-gray-400 font-mono">{vehicle?.plate}</p>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold">{driver}</p>
                      </td>
                      <td className="px-8 py-4 text-sm text-gray-500">2024-02-22</td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              const driverObj = drivers.find(d => d.full_name === driver);
                              if (driverObj) {
                                approveRental(rental.id, driverObj.id, driver);
                                alert(`Aluguel aprovado para ${driver}!`);
                              } else {
                                alert('Motorista não encontrado no sistema.');
                              }
                            }}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Aprovar Aluguel"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => {
                              rejectRental(rental.id, driver);
                              alert(`Solicitação de ${driver} rejeitada.`);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Rejeitar Solicitação"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
