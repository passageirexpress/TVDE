import React, { useState } from 'react';
import { Plus, Search, Building2, Mail, MoreHorizontal, X, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { Company } from '../types';
import { useDataStore } from '../store/useDataStore';

export default function Companies() {
  const { companies, addCompany, updateCompany, deleteCompany } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nif: '',
    email: '',
    address: '',
    iban: '',
    status: 'active' as Company['status'],
    plan: 'free' as Company['plan'],
    admin_name: '',
    admin_email: '',
    admin_password: ''
  });

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar esta empresa? Esta ação não pode ser revertida e eliminará todos os dados associados.')) {
      try {
        deleteCompany(id);
        toast.success('Empresa eliminada com sucesso!');
      } catch (error: any) {
        toast.error('Erro ao eliminar empresa: ' + error.message);
      }
    }
  };

  const handleOpenModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name || '',
        nif: company.nif || '',
        email: company.email || '',
        address: company.address || '',
        iban: company.iban || '',
        status: company.status || 'active',
        plan: company.plan || 'free',
        admin_name: '',
        admin_email: '',
        admin_password: ''
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        nif: '',
        email: '',
        address: '',
        iban: '',
        status: 'active',
        plan: 'free',
        admin_name: '',
        admin_email: '',
        admin_password: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.nif) {
      toast.error('Por favor, preencha pelo menos o nome e o NIF.');
      return;
    }

    if (!editingCompany && (!formData.admin_email || !formData.admin_password)) {
      toast.error('Por favor, preencha o email e senha do administrador para a nova empresa.');
      return;
    }

    if (editingCompany) {
      updateCompany(editingCompany.id, formData);
      toast.success('Empresa atualizada com sucesso!');
    } else {
      const newCompany: Company = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        plan: 'free',
        subscription_status: 'active',
        ...formData
      };
      addCompany(newCompany);
      toast.success('Empresa criada com sucesso! O administrador foi registado.');
    }
    setShowModal(false);
  };

  const filteredCompanies = companies.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.nif || '').includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Empresas (SaaS)</h1>
          <p className="text-gray-500 mt-1">Gerencie as frotas que utilizam o seu sistema.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-sidebar text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10"
        >
          <Plus className="w-5 h-5" />
          Nova Empresa
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou NIF..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sidebar/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="data-grid-header">Nome da Empresa</th>
                <th className="data-grid-header">NIF</th>
                <th className="data-grid-header">Email</th>
                <th className="data-grid-header">Data de Criação</th>
                <th className="data-grid-header">Status</th>
                <th className="data-grid-header text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="data-grid-row">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-sidebar/10 rounded-full flex items-center justify-center text-sidebar font-bold text-sm">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{company.name}</p>
                        <p className="text-[10px] text-gray-400">{company.address || 'Sem morada'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {company.nif}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {company.email || '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {new Date(company.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                      company.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                    )}>
                      {company.status === 'active' ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(company)}
                        className="p-2 text-gray-400 hover:text-sidebar rounded-lg hover:bg-gray-100 transition-colors"
                        title="Editar"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(company.id)}
                        className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingCompany ? 'Editar Empresa' : 'Nova Empresa'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Nome da Empresa</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">NIF</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.nif || ''}
                    onChange={(e) => setFormData({...formData, nif: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Email Financeiro</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">IBAN</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.iban || ''}
                    onChange={(e) => setFormData({...formData, iban: e.target.value})}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Morada Fiscal</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({...formData, status: e.target.value as Company['status']})}
                  >
                    <option value="active">Ativa</option>
                    <option value="inactive">Inativa</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Plano</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.plan || 'free'}
                    onChange={(e) => setFormData({...formData, plan: e.target.value as Company['plan']})}
                  >
                    <option value="free">Gratuito</option>
                    <option value="basic">Básico</option>
                    <option value="pro">Profissional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              {!editingCompany && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-sidebar" />
                    Dados do Administrador Inicial
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Nome do Admin</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={formData.admin_name}
                        onChange={(e) => setFormData({...formData, admin_name: e.target.value})}
                        placeholder="Ex: João Silva"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Email do Admin</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={formData.admin_email}
                        onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                        placeholder="admin@empresa.pt"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Senha do Admin</label>
                      <input 
                        type="password" 
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={formData.admin_password}
                        onChange={(e) => setFormData({...formData, admin_password: e.target.value})}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}
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
                {editingCompany ? 'Salvar Alterações' : 'Criar Empresa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
