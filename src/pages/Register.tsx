import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, ArrowRight, Building2, Mail, Lock, User, Hash, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, isValidNIF } from '../lib/utils';
import { useDataStore } from '../store/useDataStore';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'free';
  const [loading, setLoading] = useState(false);
  const { addCompany, addUser } = useDataStore();
  const [formData, setFormData] = useState({
    company_name: '',
    company_nif: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    plan: selectedPlan,
    acceptTerms: false
  });

  useEffect(() => {
    if (selectedPlan) {
      setFormData(prev => ({ ...prev, plan: selectedPlan }));
    }
  }, [selectedPlan]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.acceptTerms) {
      alert('Por favor, aceite os Termos de Serviço e a Política de Privacidade.');
      setLoading(false);
      return;
    }

    if (!isValidNIF(formData.company_nif)) {
      alert('O NIF introduzido é inválido. Por favor, verifique e tente novamente.');
      setLoading(false);
      return;
    }

    try {
      const isPlaceholder = import.meta.env.VITE_SUPABASE_URL?.includes('placeholder') || !import.meta.env.VITE_SUPABASE_URL;
      
      if (isPlaceholder) {
        // Local fallback
        const companyId = crypto.randomUUID();
        addCompany({
          id: companyId,
          name: formData.company_name,
          nif: formData.company_nif,
          status: 'active',
          plan: formData.plan as any,
          subscription_status: 'active',
          created_at: new Date().toISOString()
        });
        
        addUser({
          id: crypto.randomUUID(),
          email: formData.admin_email,
          full_name: formData.admin_name,
          role: 'admin',
          company_id: companyId,
          password: formData.admin_password // Store password for local login fallback
        });
        
        alert('Empresa registada com sucesso (Modo Local)! Por favor, faça login.');
        navigate('/login');
        return;
      }

      const response = await fetch('/api/auth/register-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro ao registar empresa');

      if (result.checkoutUrl) {
        alert('Empresa registada com sucesso! Você será redirecionado para o pagamento.');
        window.location.href = result.checkoutUrl;
      } else {
        alert('Empresa registada com sucesso! Por favor, faça login.');
        navigate('/login');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-sidebar p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-white">
            <Zap className="w-8 h-8" />
            <span className="text-2xl font-black tracking-tighter uppercase">TVDE Fleet</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white tracking-tighter leading-[0.9] mb-6">
            JUNTE-SE À <br />
            REVOLUÇÃO TVDE.
          </h1>
          <p className="text-white/60 text-lg max-w-md leading-relaxed">
            A plataforma que está a transformar a gestão de frotas em Portugal. 
            Registe a sua empresa em menos de 2 minutos.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-white/40 text-sm font-bold uppercase tracking-widest">
          <span>Seguro</span>
          <div className="w-1 h-1 bg-white/20 rounded-full"></div>
          <span>Escalável</span>
          <div className="w-1 h-1 bg-white/20 rounded-full"></div>
          <span>API-First</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 p-8 md:p-20 flex flex-col justify-center bg-white relative">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-black tracking-tighter mb-2">CRIAR CONTA.</h2>
            <p className="text-slate-500">Comece hoje a gerir a sua frota com inteligência.</p>
            
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sidebar/10 rounded-xl flex items-center justify-center text-sidebar">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plano Selecionado</p>
                  <p className="text-sm font-black uppercase tracking-tight">{formData.plan}</p>
                </div>
              </div>
              <Link to="/#pricing" className="text-[10px] font-bold text-sidebar uppercase tracking-widest hover:underline">Alterar</Link>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome da Empresa</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    type="text" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-sidebar/20 transition-all font-medium"
                    placeholder="Ex: Minha Frota Lda"
                    value={formData.company_name}
                    onChange={e => setFormData({...formData, company_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NIF da Empresa</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    type="text" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-sidebar/20 transition-all font-medium"
                    placeholder="9 dígitos"
                    value={formData.company_nif}
                    onChange={e => setFormData({...formData, company_nif: e.target.value})}
                  />
                </div>
              </div>

              <div className="h-px bg-slate-100 my-8"></div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">O Seu Nome (Admin)</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    type="text" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-sidebar/20 transition-all font-medium"
                    placeholder="Nome completo"
                    value={formData.admin_name}
                    onChange={e => setFormData({...formData, admin_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email de Acesso</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    type="email" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-sidebar/20 transition-all font-medium"
                    placeholder="seu@email.com"
                    value={formData.admin_email}
                    onChange={e => setFormData({...formData, admin_email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    type="password" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-sidebar/20 transition-all font-medium"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.admin_password}
                    onChange={e => setFormData({...formData, admin_password: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-start gap-3 mt-4">
                <input 
                  id="terms"
                  type="checkbox" 
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-sidebar focus:ring-sidebar"
                  checked={formData.acceptTerms}
                  onChange={e => setFormData({...formData, acceptTerms: e.target.checked})}
                />
                <label htmlFor="terms" className="text-sm text-slate-500 leading-relaxed">
                  Li e aceito os <Link to="/terms" target="_blank" className="text-sidebar font-bold hover:underline">Termos de Serviço</Link> e a <Link to="/privacy" target="_blank" className="text-sidebar font-bold hover:underline">Política de Privacidade</Link>.
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-sidebar text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-sidebar/30 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>Criar Minha Frota <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Já tem uma conta? <Link to="/login" className="text-sidebar font-bold hover:underline">Faça Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
