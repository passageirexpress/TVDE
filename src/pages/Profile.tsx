import React, { useState } from 'react';
import { User, Mail, Phone, CreditCard, Shield, Bell, Lock, Save, Camera, FileText, Upload, Calendar, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

export default function Profile() {
  const user = useAuthStore(state => state.user);
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Dados Pessoais', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
  ];

  if (user?.role === 'driver') {
    tabs.push({ id: 'documents', label: 'Documentos TVDE', icon: FileText });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-gray-500 mt-1">Gerencie suas informações pessoais e preferências de conta.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-sidebar relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <div className="w-24 h-24 bg-gray-200 rounded-2xl border-4 border-white flex items-center justify-center overflow-hidden">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <button className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <Camera className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <h2 className="text-2xl font-bold">{user?.full_name}</h2>
          <p className="text-gray-500 uppercase text-[10px] font-bold tracking-widest mt-1">
            {user?.role === 'admin' ? 'Administrador' : user?.role === 'driver' ? 'Motorista' : 'Gestor'}
          </p>
        </div>

        <div className="px-8 border-b border-gray-50 flex gap-8 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
                activeTab === tab.id ? "border-sidebar text-sidebar" : "border-transparent text-gray-400 hover:text-gray-600"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'personal' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      defaultValue={user?.full_name}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sidebar/10 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      defaultValue={user?.email}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sidebar/10 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      placeholder="+351 912 345 678"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sidebar/10 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">NIF</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      placeholder="123 456 789"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sidebar/10 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <button 
                  onClick={() => alert('Alterações salvas com sucesso!')}
                  className="bg-sidebar text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20"
                >
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Senha Atual</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sidebar/10 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sidebar/10 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Confirmar Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sidebar/10 outline-none"
                  />
                </div>
              </div>
              <div className="pt-6">
                <button 
                  onClick={() => alert('Senha alterada com sucesso!')}
                  className="bg-sidebar text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20"
                >
                  <Shield className="w-5 h-5" />
                  Atualizar Senha
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4">
                {[
                  { id: 'n1', label: 'Notificações de Pagamento', desc: 'Receba um aviso quando um novo pagamento for processado.' },
                  { id: 'n2', label: 'Alertas de Documentos', desc: 'Avisos sobre vencimento de seguros e inspeções.' },
                  { id: 'n3', label: 'Novidades do Sistema', desc: 'Fique por dentro de novas funcionalidades e atualizações.' },
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-sidebar cursor-pointer">
                      <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">Documentação Pendente</p>
                  <p className="text-xs text-amber-700">Carregue seus documentos TVDE para validação. Sua conta pode ser suspensa se os documentos expirarem.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Carta de Condução', type: 'license', required: true },
                  { label: 'Certificado TVDE', type: 'tvde_cert', required: true },
                  { label: 'Cartão de Cidadão', type: 'id_card', required: true },
                  { label: 'Comprovativo Morada', type: 'address_proof', required: false },
                ].map(doc => (
                  <div key={doc.type} className="p-6 border border-gray-100 rounded-3xl space-y-4 hover:border-sidebar/20 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:text-sidebar transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{doc.label}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                            {doc.required ? 'Obrigatório' : 'Opcional'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Data de Validade</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input 
                            type="date"
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sidebar/10"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <input type="file" className="hidden" id={`file-${doc.type}`} />
                        <label 
                          htmlFor={`file-${doc.type}`}
                          className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-sidebar/20 transition-all"
                        >
                          <Upload className="w-6 h-6 text-gray-300 mb-2" />
                          <p className="text-xs font-bold text-gray-500">Clique para carregar</p>
                          <p className="text-[10px] text-gray-400">PDF, JPG ou PNG (Max. 5MB)</p>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <button 
                  onClick={() => alert('Documentos enviados para validação!')}
                  className="bg-sidebar text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20"
                >
                  <Upload className="w-5 h-5" />
                  Enviar para Validação
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
