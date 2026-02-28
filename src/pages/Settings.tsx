import React, { useState } from 'react';
import { Building2, Save, Mail, MapPin, CreditCard, Hash } from 'lucide-react';
import { CompanySettings } from '../types';
import { useDataStore } from '../store/useDataStore';

export default function Settings() {
  const { settings: storeSettings, updateSettings } = useDataStore();
  const [settings, setSettings] = useState<CompanySettings>(storeSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      updateSettings(settings);
      setIsSaving(false);
      alert('Dados de faturamento da empresa atualizados com sucesso!');
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações da Empresa</h1>
        <p className="text-gray-500 mt-1">Gerencie os dados de faturamento para que os motoristas possam emitir Recibos Verdes.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center gap-4">
          <div className="p-3 bg-sidebar/5 text-sidebar rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Dados de Faturamento</h3>
            <p className="text-sm text-gray-400">Estas informações serão exibidas aos motoristas no painel de pagamentos.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Building2 className="w-3 h-3" /> Nome da Empresa
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                value={settings.name}
                onChange={e => setSettings({...settings, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Hash className="w-3 h-3" /> NIF
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                value={settings.nif}
                onChange={e => setSettings({...settings, nif: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Morada Fiscal
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                value={settings.address}
                onChange={e => setSettings({...settings, address: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Mail className="w-3 h-3" /> Email Financeiro
              </label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                value={settings.email}
                onChange={e => setSettings({...settings, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <CreditCard className="w-3 h-3" /> IBAN da Empresa
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                value={settings.iban}
                onChange={e => setSettings({...settings, iban: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="bg-sidebar text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
        <div className="flex gap-4">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg h-fit">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900">Nota sobre Recibos Verdes</h4>
            <p className="text-sm text-amber-800 mt-1 leading-relaxed">
              Certifique-se de que os dados acima estão corretos. Os motoristas utilizarão estes dados para emitir os Recibos Verdes (com IVA de 6% se aplicável) e enviá-los através do painel do motorista para processamento de pagamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
