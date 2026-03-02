import React, { useState } from 'react';
import { Save, Shield, Mail, CreditCard, Globe, Database, Bell, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function MasterSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'email' | 'payments'>('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Configurações globais salvas com sucesso!');
    }, 1000);
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: Globe },
    { id: 'api', label: 'Integrações API', icon: Database },
    { id: 'email', label: 'Email (Resend)', icon: Mail },
    { id: 'payments', label: 'Pagamentos (Viva)', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações Master</h1>
          <p className="text-gray-500 mt-1">Gerencie as configurações globais do SaaS e chaves de API.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-sidebar text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all border-l-4",
                  activeTab === tab.id 
                    ? "bg-sidebar/5 border-sidebar text-sidebar" 
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-sidebar" />
                Configurações do Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Nome do SaaS</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    defaultValue="TVDE Fleet SaaS"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">URL Base</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    defaultValue="https://tvdefleet.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Email de Suporte</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    defaultValue="suporte@tvdefleet.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Manutenção Global</label>
                  <select className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10">
                    <option value="off">Desativada</option>
                    <option value="on">Ativada</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Database className="w-5 h-5 text-sidebar" />
                Chaves de API Globais
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                  <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-800">
                    Estas chaves são usadas para funcionalidades globais do sistema. 
                    As empresas individuais configuram suas próprias chaves nas suas definições.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Google Maps API Key</label>
                    <input 
                      type="password" 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                      placeholder="••••••••••••••••"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Supabase Service Role Key</label>
                    <input 
                      type="password" 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                      placeholder="••••••••••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-sidebar" />
                Configuração Resend (Email)
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Resend API Key</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    placeholder="re_xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Email de Envio (From)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    defaultValue="onboarding@resend.dev"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sidebar" />
                Configuração Viva Wallet (Checkout)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Client ID</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Client Secret</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Merchant ID</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    placeholder="Merchant ID"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">API Key</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
