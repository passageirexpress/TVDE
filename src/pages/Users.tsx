import React, { useState } from 'react';
import { Plus, Search, Shield, Mail, MoreHorizontal, UserPlus, X, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from '../types';
import { useDataStore } from '../store/useDataStore';

export default function Users() {
  const { users, addUser, updateUser } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'manager' as User['role'],
    password: '',
    permissions: [] as string[]
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        password: user.password || '',
        permissions: user.permissions || []
      });
    } else {
      setEditingUser(null);
      setFormData({
        full_name: '',
        email: '',
        role: 'manager',
        password: '',
        permissions: []
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.full_name || !formData.email) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, formData);
      alert('Usuário atualizado com sucesso!');
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      };
      addUser(newUser);
      alert('Usuário adicionado com sucesso!');
    }
    setShowModal(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-purple-100">Admin</span>;
      case 'finance':
        return <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-blue-100">Financeiro</span>;
      case 'manager':
        return <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-100">Gestor</span>;
      default:
        return null;
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Acessos</h1>
          <p className="text-gray-500 mt-1">Gerencie os administradores e níveis de permissão do sistema.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-sidebar text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10"
        >
          <UserPlus className="w-5 h-5" />
          Novo Administrador
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
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
                <th className="data-grid-header">Nome Completo</th>
                <th className="data-grid-header">Email</th>
                <th className="data-grid-header">Nível de Acesso</th>
                <th className="data-grid-header text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="data-grid-row">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm">
                        {user.full_name.charAt(0)}
                      </div>
                      <p className="text-sm font-bold">{user.full_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => handleOpenModal(user)}
                      className="p-2 text-gray-400 hover:text-sidebar rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Nome Completo</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Nível de Acesso</label>
                <select 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as User['role']})}
                >
                  <option value="admin">Administrador</option>
                  <option value="finance">Financeiro</option>
                  <option value="manager">Gestor</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Senha</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Permissões Específicas</label>
                <div className="grid grid-cols-2 gap-2">
                  {['financeiro', 'frota', 'motoristas', 'relatorios', 'configuracoes'].map(perm => (
                    <label key={perm} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input 
                        type="checkbox" 
                        className="rounded text-sidebar focus:ring-sidebar/10"
                        checked={formData.permissions.includes(perm)}
                        onChange={(e) => {
                          const newPerms = e.target.checked 
                            ? [...formData.permissions, perm]
                            : formData.permissions.filter(p => p !== perm);
                          setFormData({...formData, permissions: newPerms});
                        }}
                      />
                      <span className="text-xs capitalize">{perm}</span>
                    </label>
                  ))}
                </div>
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
                {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
          <div className="flex items-center gap-3 text-purple-700 mb-2">
            <Shield className="w-5 h-5" />
            <span className="font-bold text-sm uppercase">Admin</span>
          </div>
          <p className="text-xs text-purple-600 leading-relaxed">
            Acesso total ao sistema, incluindo gestão de usuários, configurações financeiras e exclusão de dados.
          </p>
        </div>
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-3 text-blue-700 mb-2">
            <Shield className="w-5 h-5" />
            <span className="font-bold text-sm uppercase">Financeiro</span>
          </div>
          <p className="text-xs text-blue-600 leading-relaxed">
            Acesso aos módulos de faturamento, pagamentos e relatórios. Não pode alterar dados de motoristas ou veículos.
          </p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-3 text-emerald-700 mb-2">
            <Shield className="w-5 h-5" />
            <span className="font-bold text-sm uppercase">Gestor</span>
          </div>
          <p className="text-xs text-emerald-600 leading-relaxed">
            Acesso operacional para gerir motoristas e veículos. Pode visualizar relatórios básicos de desempenho.
          </p>
        </div>
      </div>
    </div>
  );
}
