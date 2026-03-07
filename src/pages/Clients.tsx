import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Hotel, 
  Utensils, 
  Briefcase, 
  User,
  X,
  ChevronRight,
  Edit2,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';
import { Client } from '../types';

export default function Clients() {
  const user = useAuthStore(state => state.user);
  const { clients, addClient, updateClient } = useDataStore();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    nif: '',
    address: '',
    type: 'corporate'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const client: Client = {
      id: crypto.randomUUID(),
      company_id: user?.company_id || '',
      ...formData as any,
      created_at: new Date().toISOString()
    };
    addClient(client);
    toast.success('Cliente registado com sucesso!');
    setShowModal(false);
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || c.type === filterType;
    return matchesSearch && matchesType;
  });

  const getClientIcon = (type: string) => {
    switch (type) {
      case 'hotel': return <Hotel className="w-4 h-4" />;
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      case 'agency': return <Briefcase className="w-4 h-4" />;
      case 'individual': return <User className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Gestão de Clientes</h1>
          <p className="text-gray-500 mt-1 font-medium">Parceiros B2B e Clientes Privados.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-sidebar text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Procurar cliente..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-sidebar/10 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-sidebar/10 outline-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos os Tipos</option>
              <option value="hotel">Hotéis</option>
              <option value="agency">Agências</option>
              <option value="corporate">Empresas</option>
              <option value="individual">Privados</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredClients.map(client => (
            <div key={client.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:border-sidebar/20 transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div className={cn(
                  "p-3 rounded-2xl",
                  client.type === 'hotel' ? "bg-blue-50 text-blue-600" :
                  client.type === 'agency' ? "bg-purple-50 text-purple-600" :
                  client.type === 'corporate' ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-600"
                )}>
                  {getClientIcon(client.type)}
                </div>
                <button className="p-2 text-gray-300 hover:text-sidebar transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 leading-tight">{client.name}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{client.type}</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                    <Mail className="w-4 h-4 text-gray-300" />
                    {client.email || 'Sem email'}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                    <Phone className="w-4 h-4 text-gray-300" />
                    {client.phone || 'Sem telefone'}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                    <MapPin className="w-4 h-4 text-gray-300" />
                    <span className="truncate">{client.address || 'Sem morada'}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="w-full py-3 bg-gray-50 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                    Ver Serviços
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold">Nenhum cliente encontrado.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Novo Cliente</h2>
                <p className="text-sm text-gray-500 font-medium">Registe um novo parceiro ou cliente direto</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nome do Cliente / Empresa</label>
                <input 
                  required
                  placeholder="Ex: Hotel Tivoli Avenida"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="corporate">Empresa</option>
                    <option value="hotel">Hotel</option>
                    <option value="agency">Agência</option>
                    <option value="restaurant">Restaurante</option>
                    <option value="individual">Privado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">NIF</label>
                  <input 
                    placeholder="Ex: 500123456"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.nif}
                    onChange={e => setFormData({...formData, nif: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
                  <input 
                    type="email"
                    placeholder="Ex: reservas@hotel.pt"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Telefone</label>
                  <input 
                    placeholder="Ex: 912345678"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Morada</label>
                <input 
                  placeholder="Ex: Avenida da Liberdade, 123"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sidebar/10 outline-none font-medium"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
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
                  Registar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
