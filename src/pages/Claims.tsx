import React, { useState } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  User, 
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Camera,
  FileText,
  MoreVertical,
  X,
  Car
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { Claim } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function ClaimsPage() {
  const { vehicles, drivers, claims, addClaim, updateClaim } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newClaim, setNewClaim] = useState<Partial<Claim>>({
    date: new Date().toISOString().split('T')[0],
    status: 'reported',
    photos: []
  });

  const handleAddClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaim.vehicle_id || !newClaim.driver_id || !newClaim.description) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSaving(true);
    try {
      const claim: Claim = {
        id: crypto.randomUUID(),
        vehicle_id: newClaim.vehicle_id!,
        driver_id: newClaim.driver_id!,
        date: newClaim.date!,
        location: newClaim.location || 'Não especificado',
        description: newClaim.description!,
        status: 'reported',
        photos: [],
        created_at: new Date().toISOString()
      };

      await addClaim(claim);
      setShowAddModal(false);
      setNewClaim({
        date: new Date().toISOString().split('T')[0],
        status: 'reported',
        photos: []
      });
      toast.success('Sinistro reportado com sucesso! Os administradores foram notificados.');
    } catch (error: any) {
      toast.error('Erro ao reportar sinistro: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredClaims = claims.filter(c => {
    const vehicle = vehicles.find(v => v.id === c.vehicle_id);
    const driver = drivers.find(d => d.id === c.driver_id);
    const matchesSearch = vehicle?.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         driver?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusLabel = (status: Claim['status']) => {
    switch (status) {
      case 'reported': return 'Reportado';
      case 'in_progress': return 'Em Processamento';
      case 'resolved': return 'Resolvido';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  const getStatusColor = (status: Claim['status']) => {
    switch (status) {
      case 'reported': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getStatusIcon = (status: Claim['status']) => {
    switch (status) {
      case 'reported': return AlertCircle;
      case 'in_progress': return Clock;
      case 'resolved': return CheckCircle2;
      case 'rejected': return XCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">SINISTROS</h1>
          <p className="text-gray-500 mt-1 font-medium">Gestão de acidentes e ocorrências da frota</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-sidebar text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20"
        >
          <Plus className="w-5 h-5" />
          Reportar Ocorrência
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Ocorrências</p>
          <h3 className="text-2xl font-bold text-gray-900">{claims.length}</h3>
          <p className="text-xs text-gray-400 mt-2">Desde o início do ano</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Em Aberto</p>
          <h3 className="text-2xl font-bold text-gray-900">{claims.filter(c => c.status === 'reported').length}</h3>
          <p className="text-xs text-gray-400 mt-2">A aguardar análise</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Em Processamento</p>
          <h3 className="text-2xl font-bold text-gray-900">{claims.filter(c => c.status === 'in_progress').length}</h3>
          <p className="text-xs text-gray-400 mt-2">Com a seguradora</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Resolvidos</p>
          <h3 className="text-2xl font-bold text-gray-900">{claims.filter(c => c.status === 'resolved').length}</h3>
          <p className="text-xs text-gray-400 mt-2">Processos concluídos</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Procurar por matrícula, motorista ou descrição..."
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
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Ocorrência</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Veículo / Motorista</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Localização</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider">Evidências</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase text-gray-400 tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClaims.length > 0 ? (
                filteredClaims.map((c) => {
                  const vehicle = vehicles.find(v => v.id === c.vehicle_id);
                  const driver = drivers.find(d => d.id === c.driver_id);
                  const StatusIcon = getStatusIcon(c.status);
                  
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{c.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{c.date}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Car className="w-3 h-3 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{vehicle?.plate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{driver?.full_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="line-clamp-1">{c.location}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                          getStatusColor(c.status)
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {getStatusLabel(c.status)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map((_, i) => (
                              <div key={i} className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-gray-400">
                                <Camera className="w-4 h-4" />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs font-bold text-gray-400">+{c.photos.length}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-sidebar hover:bg-gray-100 rounded-lg transition-all">
                            <FileText className="w-5 h-5" />
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
                  <td colSpan={6} className="px-8 py-12 text-center text-gray-400 italic">
                    Nenhum sinistro reportado.
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
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Reportar Ocorrência</h2>
                <p className="text-sm text-gray-500 font-medium">Registe um novo sinistro ou incidente na frota</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAddClaim} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Veículo</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={newClaim.vehicle_id || ''}
                    onChange={e => setNewClaim({...newClaim, vehicle_id: e.target.value})}
                  >
                    <option value="">Selecione o Veículo</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Motorista</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={newClaim.driver_id || ''}
                    onChange={e => setNewClaim({...newClaim, driver_id: e.target.value})}
                  >
                    <option value="">Selecione o Motorista</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data da Ocorrência</label>
                  <input 
                    required type="date"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={newClaim.date || ''}
                    onChange={e => setNewClaim({...newClaim, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Localização</label>
                  <input 
                    required
                    placeholder="Ex: Av. da Liberdade, Lisboa"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={newClaim.location || ''}
                    onChange={e => setNewClaim({...newClaim, location: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descrição Detalhada</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Descreva o que aconteceu com o máximo de detalhe possível..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium resize-none"
                  value={newClaim.description || ''}
                  onChange={e => setNewClaim({...newClaim, description: e.target.value})}
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
                  disabled={isSaving}
                  className="flex-1 py-4 bg-sidebar text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-sidebar/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {isSaving ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Reportar Sinistro'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
