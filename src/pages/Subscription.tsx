import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Building2,
  ExternalLink,
  X,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Company } from '../types';
import VivaPaymentForm from '../components/VivaPaymentForm';

export default function Subscription() {
  const user = useAuthStore(state => state.user);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const fetchCompany = async () => {
    if (!user?.company_id) return;
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('id', user.company_id)
      .single();
    
    if (data) setCompany(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCompany();
  }, [user]);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '0',
      features: ['Até 2 viaturas', 'Gestão básica', 'Relatórios semanais'],
      color: 'bg-slate-100 text-slate-600'
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '19',
      features: ['Até 10 viaturas', 'Sincronização API', 'Suporte email'],
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '49',
      features: ['Viaturas ilimitadas', 'Sincronização Total', 'Gestão Documental'],
      color: 'bg-sidebar/10 text-sidebar'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '99',
      features: ['Multi-tenant', 'API Customizada', 'Account Manager'],
      color: 'bg-indigo-50 text-indigo-600'
    }
  ];

  const handleUpgrade = async (planId: string, amount: string) => {
    if (!user) return;
    
    setIsProcessing(true);
    setSelectedPlan(planId);
    setSelectedAmount(parseFloat(amount));
    
    try {
      const response = await fetch('/api/viva/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          planId,
          companyId: user.company_id,
          customerEmail: user.email,
          customerName: user.full_name
        })
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || "Erro inesperado do servidor.");
      }
      
      if (!response.ok) {
        throw new Error(data.error || data.message || "Erro ao iniciar checkout.");
      }

      if (data.orderCode) {
        setOrderCode(data.orderCode);
        setShowPaymentForm(true);
      } else {
        throw new Error("Não foi possível gerar o código da ordem.");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "Erro de conexão com o servidor.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setShowPaymentForm(false);
    setOrderCode(null);
    setPaymentSuccess(true);
    fetchCompany();
    // Reset success message after 5 seconds
    setTimeout(() => setPaymentSuccess(false), 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-sidebar border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Assinatura & Planos</h1>
          <p className="text-slate-500">Gira o seu plano e pagamentos com a Viva Wallet.</p>
        </div>
      </div>

      {/* Current Plan Card */}
      {paymentSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[32px] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-emerald-900 font-bold">Pagamento Confirmado!</h3>
            <p className="text-emerald-700 text-sm">O seu plano foi atualizado com sucesso. Aproveite todas as funcionalidades.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Zap className="w-32 h-32" />
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-20 h-20 bg-sidebar/5 rounded-3xl flex items-center justify-center">
            <Zap className="w-10 h-10 text-sidebar" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Plano Atual</span>
              {company?.subscription_status === 'active' && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-widest">Ativo</span>
              )}
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase">{company?.plan || 'Free'}</h2>
            <p className="text-slate-500 text-sm mt-1">
              Próxima faturação em: <span className="font-bold text-slate-900">28 de Março, 2026</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-slate-50 text-slate-900 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
              <Clock className="w-4 h-4" /> Histórico
            </button>
            <button className="px-6 py-3 bg-sidebar text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-sidebar/20 flex items-center gap-2">
              Gerir na Viva Wallet <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={cn(
              "bg-white rounded-[32px] border p-6 flex flex-col transition-all hover:shadow-xl",
              company?.plan === plan.id ? "border-sidebar ring-4 ring-sidebar/5" : "border-slate-100"
            )}
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", plan.color)}>
              <Shield className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-black tracking-tighter uppercase mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black">€{plan.price}</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">/mês</span>
            </div>

            <div className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium text-slate-600">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleUpgrade(plan.id, plan.price)}
              disabled={company?.plan === plan.id || isProcessing}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                company?.plan === plan.id 
                  ? "bg-slate-50 text-slate-400 cursor-default" 
                  : "bg-sidebar text-white hover:bg-black shadow-lg shadow-sidebar/10"
              )}
            >
              {isProcessing && selectedPlan === plan.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : company?.plan === plan.id ? (
                'Plano Atual'
              ) : (
                'Escolher'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Checkout Modal */}
      {showPaymentForm && orderCode && user?.company_id && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="animate-in zoom-in-95 duration-300 w-full max-w-md">
            <VivaPaymentForm 
              amount={selectedAmount}
              orderCode={orderCode}
              companyId={user.company_id}
              planId={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onCancel={() => {
                setShowPaymentForm(false);
                setOrderCode(null);
                setSelectedPlan(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black tracking-tighter uppercase">Método de Pagamento</h3>
            <p className="text-slate-500 text-sm">Cartão associado à sua conta Viva Wallet.</p>
          </div>
          <button className="text-sidebar font-bold text-sm uppercase tracking-widest hover:underline">Alterar</button>
        </div>

        <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
          <div className="w-12 h-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-[10px]">
            VISA
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">•••• •••• •••• 4242</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest">Expira em 12/28</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-indigo-600 rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Precisa de um plano personalizado?</h3>
            <p className="text-white/70 text-sm">Para frotas com mais de 100 viaturas, entre em contacto connosco.</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all">
          Falar com Vendas
        </button>
      </div>
    </div>
  );
}
