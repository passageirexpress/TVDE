import React, { useState } from 'react';
import { Plus, Search, Car as CarIcon, AlertTriangle, CheckCircle2, MoreVertical, ChevronDown, ChevronUp, History, User, ExternalLink, X, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';

export default function Vehicles() {
  const { vehicles, addVehicle, updateVehicle } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    plate: '',
    current_driver_id: '',
    insurance: '',
    inspection: '',
    status: 'active'
  });

  const handleOpenModal = (vehicle?: any) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        brand: vehicle.brand,
        model: vehicle.model,
        plate: vehicle.plate,
        current_driver_id: vehicle.current_driver_id || '',
        insurance: vehicle.insurance || vehicle.insurance_expiry,
        inspection: vehicle.inspection || vehicle.inspection_expiry,
        status: vehicle.status
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        brand: '',
        model: '',
        plate: '',
        current_driver_id: '',
        insurance: '',
        inspection: '',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.brand || !formData.model || !formData.plate) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, formData as any);
      alert('Veículo atualizado com sucesso!');
    } else {
      const newVehicle = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        year: new Date().getFullYear(),
        category: 'Economy',
        entry_date: new Date().toISOString().split('T')[0],
        insurance_expiry: formData.insurance,
        inspection_expiry: formData.inspection,
        policy_number: 'N/A',
        documents: [],
        history: []
      } as any;
      addVehicle(newVehicle);
      alert('Veículo adicionado com sucesso!');
    }
    setShowModal(false);
  };

  const filteredVehicles = vehicles.filter((v: any) => 
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.driver && v.driver.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleVehicleStatus = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id) as any;
    if (vehicle) {
      const newStatus = vehicle.status === 'active' ? 'maintenance' : 'active';
      updateVehicle(id, { status: newStatus as any });
      alert(`Veículo ${vehicle.plate} agora está em ${newStatus === 'active' ? 'Operação' : 'Manutenção'}.`);
    }
  };

  const isExpiringSoon = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const today = new Date();
    return expiry < today;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Veículos</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Gerencie sua frota de veículos e prazos de manutenção.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-sidebar text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 h-5" />
          Novo Veículo
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por marca, modelo, matrícula ou motorista..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sidebar/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVehicles.map((v) => {
          const insuranceExpiring = isExpiringSoon(v.insurance);
          const insuranceExpired = isExpired(v.insurance);
          const inspectionExpiring = isExpiringSoon(v.inspection);
          const inspectionExpired = isExpired(v.inspection);
          const hasAlert = insuranceExpiring || insuranceExpired || inspectionExpiring || inspectionExpired;

          return (
            <div 
              key={v.id} 
              className={cn(
                "bg-white rounded-2xl shadow-sm border transition-all overflow-hidden relative",
                hasAlert ? "border-red-200 ring-1 ring-red-100" : "border-gray-100 hover:shadow-md"
              )}
            >
              {hasAlert && (
                <div className="bg-red-500 text-white text-[10px] font-bold uppercase py-1 px-3 flex items-center justify-center gap-2 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  Documentação Pendente
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    v.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    <CarIcon className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenModal(v)}
                      className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Editar"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold">{v.brand} {v.model}</h3>
                  <p className="text-xs font-mono bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">{v.plate}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Motorista</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {useDataStore.getState().drivers.find(d => d.id === v.current_driver_id)?.full_name || 'Ninguém'}
                      </span>
                      {v.current_driver_id && (
                        <Link 
                          to="/drivers" 
                          className="p-1 bg-gray-50 text-gray-400 hover:text-sidebar rounded-md transition-colors"
                          title="Ver Perfil"
                        >
                          <User className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Seguro</span>
                    <div className="flex items-center gap-1.5">
                      {insuranceExpired ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      ) : insuranceExpiring ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span className={cn(
                        "font-medium",
                        insuranceExpired ? "text-red-600" : insuranceExpiring ? "text-amber-600" : "text-gray-700"
                      )}>{v.insurance}</span>
                      {(insuranceExpired || insuranceExpiring) && (
                        <button 
                          onClick={() => handleOpenModal(v)}
                          className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5 ml-1"
                        >
                          Atualizar <ExternalLink className="w-2 h-2" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Inspeção</span>
                    <div className="flex items-center gap-1.5">
                      {inspectionExpired ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      ) : inspectionExpiring ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span className={cn(
                        "font-medium",
                        inspectionExpired ? "text-red-600" : inspectionExpiring ? "text-amber-600" : "text-gray-700"
                      )}>{v.inspection}</span>
                      {(inspectionExpired || inspectionExpiring) && (
                        <button 
                          onClick={() => handleOpenModal(v)}
                          className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5 ml-1"
                        >
                          Atualizar <ExternalLink className="w-2 h-2" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <button 
                    onClick={() => toggleVehicleStatus(v.id)}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded hover:opacity-80 transition-opacity",
                      v.status === 'active' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    )}
                  >
                    {v.status === 'active' ? 'Em Operação' : 'Manutenção'}
                  </button>
                  <button 
                    onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                    className={cn(
                      "text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest transition-colors",
                      expandedId === v.id ? "text-sidebar" : "text-gray-400 hover:text-sidebar"
                    )}
                  >
                    <History className="w-3 h-3" />
                    Histórico
                    {expandedId === v.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {expandedId === v.id && (
                <div className="bg-gray-50 border-t border-gray-100 p-6 animate-in slide-in-from-top-2 duration-200">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Histórico Recente</h4>
                  <div className="space-y-3">
                    {v.history && v.history.length > 0 ? (
                      v.history.map((h, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className={cn(
                              "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                              h.type === 'Manutenção' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                            )}>
                              {h.type}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">{h.date}</span>
                          </div>
                          <p className="text-xs font-bold text-gray-700">{h.description}</p>
                          <p className="text-xs font-black text-gray-900 mt-1">€{h.cost.toFixed(2)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center py-4">Sem histórico registado.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}</h2>
                <p className="text-sm text-gray-500 mt-1">Preencha os dados técnicos da viatura.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Marca</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Modelo</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Matrícula</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10 font-mono"
                  value={formData.plate}
                  onChange={(e) => setFormData({...formData, plate: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Motorista Associado</label>
                <select 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={formData.current_driver_id}
                  onChange={(e) => setFormData({...formData, current_driver_id: e.target.value})}
                >
                  <option value="">Ninguém</option>
                  {useDataStore.getState().drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Validade Seguro</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.insurance}
                    onChange={(e) => setFormData({...formData, insurance: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Validade Inspeção</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.inspection}
                    onChange={(e) => setFormData({...formData, inspection: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                <select 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Em Operação</option>
                  <option value="maintenance">Manutenção</option>
                </select>
              </div>
            </div>
            <div className="p-8 bg-gray-50 flex gap-4">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-white text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all border border-gray-100"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 bg-sidebar text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl shadow-sidebar/20 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingVehicle ? 'Salvar Alterações' : 'Adicionar Veículo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
