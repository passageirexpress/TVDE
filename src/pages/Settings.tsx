import React, { useState } from 'react';
import { Building2, Save, Mail, MapPin, CreditCard, Hash, Zap, Palette, Image as ImageIcon, Euro } from 'lucide-react';
import { toast } from 'sonner';
import { CompanySettings } from '../types';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { settings: storeSettings, updateSettings, companies } = useDataStore();
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const [settings, setSettings] = useState<CompanySettings>(storeSettings);
  const [isSaving, setIsSaving] = useState(false);

  const company = companies.find(c => c.id === user?.company_id);
  const isFreePlan = company?.plan === 'free';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          bolt_client_id: settings.bolt_client_id,
          bolt_client_secret: settings.bolt_client_secret,
          uber_client_id: settings.uber_client_id,
          uber_client_secret: settings.uber_client_secret,
          logo_url: settings.logo_url,
          primary_color: settings.primary_color,
          transfer_price_per_km: settings.transfer_price_per_km,
          transfer_price_per_min: settings.transfer_price_per_min,
          vat_rate: settings.vat_rate,
          delivery_base_price: settings.delivery_base_price,
          delivery_price_per_km: settings.delivery_price_per_km
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao atualizar configurações');
      }

      updateSettings(settings);
      toast.success('Configurações da empresa atualizadas com sucesso!');
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    } finally {
      setIsSaving(false);
    }
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
                value={settings.name || ''}
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
                value={settings.nif || ''}
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
                value={settings.address || ''}
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
                value={settings.email || ''}
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
                value={settings.iban || ''}
                onChange={e => setSettings({...settings, iban: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Euro className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Tabela de Preços (Transfers & Logística)</h3>
                <p className="text-sm text-gray-400">Configure os valores base para cálculo automático de orçamentos.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  Preço por KM (€)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={settings.transfer_price_per_km || 0}
                  onChange={e => setSettings({...settings, transfer_price_per_km: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  Preço por Minuto (€)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={settings.transfer_price_per_min || 0}
                  onChange={e => setSettings({...settings, transfer_price_per_min: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  Taxa de IVA (%)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={settings.vat_rate || 23}
                  onChange={e => setSettings({...settings, vat_rate: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  Base Entrega (€)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={settings.delivery_base_price || 0}
                  onChange={e => setSettings({...settings, delivery_base_price: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  Entrega por KM (€)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={settings.delivery_price_per_km || 0}
                  onChange={e => setSettings({...settings, delivery_price_per_km: parseFloat(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 relative">
            {isFreePlan && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-sidebar" />
                </div>
                <h4 className="text-lg font-black tracking-tighter uppercase">Personalização Premium</h4>
                <p className="text-xs text-gray-500 max-w-[240px] mt-1 mb-4">Faça upgrade para o plano Pro para personalizar o dashboard com a sua marca.</p>
                <button 
                  type="button"
                  onClick={() => navigate('/dashboard/subscription')}
                  className="px-6 py-2 bg-sidebar text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all"
                >
                  Ver Planos
                </button>
              </div>
            )}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Personalização da Marca (White-label)</h3>
                <p className="text-sm text-gray-400">Personalize a aparência do dashboard para a sua empresa.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> URL do Logótipo
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={settings.logo_url || ''}
                  onChange={e => setSettings({...settings, logo_url: e.target.value})}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Palette className="w-3 h-3" /> Cor Primária
                </label>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    className="h-12 w-20 p-1 bg-gray-50 border border-gray-200 rounded-xl outline-none cursor-pointer"
                    value={settings.primary_color || '#000000'}
                    onChange={e => setSettings({...settings, primary_color: e.target.value})}
                  />
                  <input 
                    type="text" 
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={settings.primary_color || '#000000'}
                    onChange={e => setSettings({...settings, primary_color: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 relative">
            {isFreePlan && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-sidebar" />
                </div>
                <h4 className="text-lg font-black tracking-tighter uppercase">Integração API Premium</h4>
                <p className="text-xs text-gray-500 max-w-[240px] mt-1 mb-4">A sincronização automática com Uber e Bolt está disponível apenas nos planos Pro e Enterprise.</p>
                <button 
                  type="button"
                  onClick={() => navigate('/dashboard/subscription')}
                  className="px-6 py-2 bg-sidebar text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all"
                >
                  Ver Planos
                </button>
              </div>
            )}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Integração Bolt API</h3>
                <p className="text-sm text-gray-400">Configure as credenciais para sincronização automática de ganhos e frotas.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Bolt Client ID
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={settings.bolt_client_id || ''}
                  onChange={e => setSettings({...settings, bolt_client_id: e.target.value})}
                  placeholder="Insira o Client ID da Bolt"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Bolt Client Secret
                </label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={settings.bolt_client_secret || ''}
                  onChange={e => setSettings({...settings, bolt_client_secret: e.target.value})}
                  placeholder={storeSettings.bolt_client_id ? "•••••••••••••••• (Já configurado)" : "Insira o Client Secret da Bolt"}
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-black text-white rounded-2xl">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Integração Uber API</h3>
                <p className="text-sm text-gray-400">Configure as credenciais para sincronização automática de ganhos e frotas da Uber.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Uber Client ID
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={settings.uber_client_id || ''}
                  onChange={e => setSettings({...settings, uber_client_id: e.target.value})}
                  placeholder="Insira o Client ID da Uber"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Uber Client Secret
                </label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={settings.uber_client_secret || ''}
                  onChange={e => setSettings({...settings, uber_client_secret: e.target.value})}
                  placeholder={storeSettings.uber_client_id ? "•••••••••••••••• (Já configurado)" : "Insira o Client Secret da Uber"}
                />
              </div>
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
