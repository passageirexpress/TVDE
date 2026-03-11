import React, { useState } from 'react';
import { useDataStore } from '../store/useDataStore';
import { Penalty, Driver, Vehicle } from '../types';
import { Plus, Search, Filter, AlertTriangle, CheckCircle, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

const Penalties: React.FC = () => {
  const { penalties, drivers, vehicles, addPenalty, updatePenalty, deletePenalty } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPenalty, setEditingPenalty] = useState<Penalty | null>(null);

  const [formData, setFormData] = useState<Partial<Penalty>>({
    driver_id: '',
    vehicle_id: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pendente'
  });

  const filteredPenalties = penalties.filter(p => {
    const driver = drivers.find(d => d.id === p.driver_id);
    const vehicle = vehicles.find(v => v.id === p.vehicle_id);
    const searchStr = `${driver?.full_name} ${vehicle?.plate} ${p.description}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.driver_id || !formData.vehicle_id || !formData.amount) {
      toast.error('Por favor preencha todos os campos obrigatórios');
      return;
    }

    if (editingPenalty) {
      updatePenalty(editingPenalty.id, formData);
      toast.success('Multa atualizada com sucesso');
    } else {
      const newPenalty: Penalty = {
        id: crypto.randomUUID(),
        ...formData as Penalty,
        created_at: new Date().toISOString()
      };
      addPenalty(newPenalty);
      toast.success('Multa registada com sucesso');
    }

    setIsModalOpen(false);
    setEditingPenalty(null);
    setFormData({
      driver_id: '',
      vehicle_id: '',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'pendente'
    });
  };

  const handleEdit = (penalty: Penalty) => {
    setEditingPenalty(penalty);
    setFormData(penalty);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar esta multa?')) {
      deletePenalty(id);
      toast.success('Multa eliminada');
    }
  };

  const toggleStatus = (penalty: Penalty) => {
    const newStatus = penalty.status === 'pendente' ? 'pago' : 'pendente';
    updatePenalty(penalty.id, { status: newStatus });
    toast.success(`Status da multa alterado para ${newStatus}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Multas</h1>
          <p className="text-gray-500">Registo e controlo de infrações e coimas</p>
        </div>
        <button
          onClick={() => {
            setEditingPenalty(null);
            setFormData({
              driver_id: '',
              vehicle_id: '',
              amount: 0,
              description: '',
              date: new Date().toISOString().split('T')[0],
              status: 'pendente'
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Registar Multa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-bottom border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar por motorista, matrícula ou descrição..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={20} />
              Filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Motorista</th>
                <th className="px-6 py-4">Viatura</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPenalties.length > 0 ? (
                filteredPenalties.map((penalty) => {
                  const driver = drivers.find(d => d.id === penalty.driver_id);
                  const vehicle = vehicles.find(v => v.id === penalty.vehicle_id);
                  return (
                    <tr key={penalty.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(penalty.date).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{driver?.full_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{driver?.nif}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{vehicle?.plate || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{vehicle?.brand} {vehicle?.model}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {penalty.description}
                      </td>
                      <td className="px-6 py-4 font-semibold text-red-600">
                        {penalty.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(penalty)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            penalty.status === 'pago'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {penalty.status === 'pago' ? (
                            <><CheckCircle size={14} /> Pago</>
                          ) : (
                            <><AlertTriangle size={14} /> Pendente</>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(penalty)}
                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(penalty.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    Nenhuma multa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPenalty ? 'Editar Multa' : 'Registar Nova Multa'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motorista *</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.driver_id}
                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                  >
                    <option value="">Selecionar Motorista</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Viatura *</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  >
                    <option value="">Selecionar Viatura</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Motivo *</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Excesso de velocidade A1, Estacionamento indevido..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'pendente'}
                        onChange={() => setFormData({ ...formData, status: 'pendente' })}
                      />
                      <span className="text-sm text-gray-600">Pendente</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'pago'}
                        onChange={() => setFormData({ ...formData, status: 'pago' })}
                      />
                      <span className="text-sm text-gray-600">Pago</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingPenalty ? 'Guardar Alterações' : 'Registar Multa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Penalties;
