import React, { useState } from 'react';
import { 
  HelpCircle, 
  Book, 
  MessageSquare, 
  Mail, 
  Phone, 
  Search, 
  ChevronRight, 
  ExternalLink,
  MessageCircle,
  FileText,
  Video,
  LifeBuoy
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Support() {
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      question: 'Como sincronizar os ganhos da Bolt?',
      answer: 'Para sincronizar os ganhos da Bolt, vá a Configurações > Integrações e insira o seu Client ID e Client Secret fornecidos pela Bolt. Depois, no painel financeiro, clique em "Sincronizar".'
    },
    {
      question: 'Como emitir o fecho de contas semanal?',
      answer: 'No menu Financeiro, selecione a aba "Fecho de Contas". Escolha o motorista e o período. O sistema calculará automaticamente os ganhos, descontos e alugueres.'
    },
    {
      question: 'Posso gerir mais do que uma empresa?',
      answer: 'Sim, se tiver o plano Enterprise, pode gerir múltiplas empresas (multi-tenant) a partir de um único login de administrador master.'
    },
    {
      question: 'O que fazer em caso de sinistro?',
      answer: 'O motorista deve abrir o Painel do Motorista e clicar em "Reportar Sinistro". Deve preencher os detalhes, localização e anexar fotos. O administrador será notificado imediatamente.'
    }
  ];

  const categories = [
    { icon: Book, title: 'Documentação', description: 'Guias detalhados sobre todas as funcionalidades.', color: 'bg-blue-50 text-blue-600' },
    { icon: Video, title: 'Tutoriais em Vídeo', description: 'Aprenda a usar a plataforma visualmente.', color: 'bg-purple-50 text-purple-600' },
    { icon: FileText, title: 'Modelos de Contrato', description: 'Descarregue modelos de contratos TVDE e aluguer.', color: 'bg-emerald-50 text-emerald-600' },
    { icon: LifeBuoy, title: 'Suporte Técnico', description: 'Abra um ticket para resolver problemas técnicos.', color: 'bg-amber-50 text-amber-600' }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-black tracking-tighter uppercase">Como podemos ajudar?</h1>
        <p className="text-gray-500 font-medium">Pesquise na nossa base de conhecimento ou entre em contacto com a nossa equipa de suporte.</p>
        
        <div className="relative mt-8">
          <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Ex: Como configurar a API da Uber..."
            className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[24px] shadow-xl shadow-black/5 outline-none focus:ring-2 focus:ring-sidebar/10 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div key={cat.title} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", cat.color)}>
              <cat.icon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold mb-2">{cat.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{cat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-sidebar" /> Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-gray-900">{faq.question}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <div className="px-6 pb-6 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-sidebar" /> Contacto Direto
          </h2>
          <div className="bg-sidebar rounded-[32px] p-8 text-white space-y-8 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
            
            <div className="space-y-4 relative z-10">
              <h3 className="text-xl font-bold">Suporte Prioritário</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                A nossa equipa está disponível de Segunda a Sexta, das 09:00 às 18:00.
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              <a href="mailto:suporte@tvdefleet.pt" className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                <Mail className="w-5 h-5" />
                <span className="text-sm font-bold">suporte@tvdefleet.pt</span>
              </a>
              <a href="tel:+351210000000" className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                <Phone className="w-5 h-5" />
                <span className="text-sm font-bold">+351 210 000 000</span>
              </a>
              <button className="w-full flex items-center justify-center gap-4 p-4 bg-white text-sidebar rounded-2xl hover:bg-gray-100 transition-all font-bold">
                <MessageCircle className="w-5 h-5" />
                <span>Chat em Tempo Real</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="font-bold mb-4">Estado do Sistema</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plataforma</span>
                <span className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Operacional
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">API Bolt</span>
                <span className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Operacional
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">API Uber</span>
                <span className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Operacional
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
