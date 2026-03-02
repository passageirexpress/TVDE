import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  BarChart3, 
  Users, 
  Car, 
  CheckCircle2, 
  ArrowRight,
  Play,
  Globe,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Landing() {
  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Ideal para frotas individuais ou em início.',
      features: [
        'Até 2 viaturas',
        'Gestão de motoristas básica',
        'Relatórios semanais',
        'Suporte via email'
      ],
      cta: 'Começar Grátis',
      highlight: false
    },
    {
      name: 'Pro',
      price: '49',
      description: 'O padrão para frotas em crescimento.',
      features: [
        'Viaturas ilimitadas',
        'Sincronização Bolt/Uber API',
        'Gestão de documentos avançada',
        'Alertas de manutenção',
        'Suporte prioritário'
      ],
      cta: 'Escolher Pro',
      highlight: true
    },
    {
      name: 'Enterprise',
      price: '99',
      description: 'Para grandes operações multi-empresa.',
      features: [
        'Múltiplas empresas (Multi-tenant)',
        'API de exportação personalizada',
        'Gestor de conta dedicado',
        'Formação de equipa',
        'SLA de 99.9%'
      ],
      cta: 'Contactar Vendas',
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-sidebar selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-sidebar rounded-xl flex items-center justify-center shadow-lg shadow-sidebar/20">
              <Zap className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">TVDE Fleet</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#features" className="hover:text-sidebar transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-sidebar transition-colors">Preços</a>
            <a href="#about" className="hover:text-sidebar transition-colors">Sobre</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-900 hover:text-sidebar transition-colors uppercase tracking-widest">Login</Link>
            <Link to="/register" className="bg-sidebar text-white px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-sidebar/20">
              Registar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-500 text-xs font-bold uppercase tracking-widest mb-8 border border-slate-100"
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Pronto para o Mercado Português
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
          >
            GIRA A TUA FROTA <br />
            <span className="text-sidebar">COMO UM PRO.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl leading-relaxed mb-12"
          >
            A plataforma SaaS definitiva para gestores de frotas TVDE em Portugal. 
            Automatize pagamentos, controle viaturas e escale o seu negócio com dados em tempo real.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="w-full sm:w-auto bg-sidebar text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-sidebar/30">
              Começar Agora <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
              <Play className="w-5 h-5 fill-current" /> Ver Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-sidebar/5 text-sidebar rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Sincronização API</h3>
              <p className="text-slate-500 leading-relaxed">
                Conecte diretamente com as APIs da Bolt e Uber. Esqueça o upload manual de CSVs e tenha os ganhos atualizados em tempo real.
              </p>
            </div>
            
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Conformidade Legal</h3>
              <p className="text-slate-500 leading-relaxed">
                Gestão completa de documentos TVDE. Alertas automáticos de expiração de seguros, inspeções e certificados de motorista.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Análise de Lucro</h3>
              <p className="text-slate-500 leading-relaxed">
                Dashboards avançados que mostram a rentabilidade real de cada viatura e motorista, descontando todas as taxas e despesas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">PLANOS SIMPLES.</h2>
            <p className="text-slate-500">Escolha o plano que melhor se adapta ao tamanho da sua frota.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={cn(
                  "p-10 rounded-[48px] border flex flex-col transition-all",
                  plan.highlight 
                    ? "bg-slate-900 text-white border-slate-800 shadow-2xl scale-105 z-10" 
                    : "bg-white text-slate-900 border-slate-100 shadow-sm hover:shadow-xl"
                )}
              >
                <div className="mb-8">
                  <h3 className="text-xl font-bold uppercase tracking-widest mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">€{plan.price}</span>
                    <span className={cn("text-sm font-bold opacity-50", plan.highlight ? "text-slate-400" : "text-slate-500")}>/mês</span>
                  </div>
                </div>

                <p className={cn("text-sm mb-8", plan.highlight ? "text-slate-400" : "text-slate-500")}>
                  {plan.description}
                </p>

                <div className="space-y-4 mb-12 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className={cn("w-5 h-5", plan.highlight ? "text-sidebar" : "text-emerald-500")} />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  to={`/register?plan=${plan.name.toLowerCase()}`}
                  className={cn(
                    "w-full py-5 rounded-2xl font-bold text-center transition-all",
                    plan.highlight 
                      ? "bg-sidebar text-white hover:bg-white hover:text-slate-900" 
                      : "bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white"
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">TVDE Fleet</span>
          </div>
          
          <p className="text-slate-400 text-sm">© 2026 TVDE Fleet CRM. Todos os direitos reservados.</p>
          
          <div className="flex flex-col md:flex-row items-center gap-6 text-slate-400 text-sm">
            <Link to="/terms" className="hover:text-sidebar transition-colors">Termos de Serviço</Link>
            <Link to="/privacy" className="hover:text-sidebar transition-colors">Privacidade</Link>
            <div className="flex items-center gap-6">
              <Globe className="w-5 h-5 hover:text-sidebar cursor-pointer" />
              <Lock className="w-5 h-5 hover:text-sidebar cursor-pointer" />
              <Users className="w-5 h-5 hover:text-sidebar cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
