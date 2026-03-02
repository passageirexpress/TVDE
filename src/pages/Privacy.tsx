import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Shield, Lock, Eye } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sidebar font-bold mb-8 hover:underline">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar para a Home
        </Link>
        
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-sidebar/10 rounded-2xl flex items-center justify-center text-sidebar">
              <Eye className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Política de Privacidade</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
            <p className="text-sm text-slate-400 italic">Última atualização: 01 de Março de 2026</p>
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Recolha de Dados</h2>
              <p>Recolhemos informações necessárias para a gestão da sua frota, incluindo dados de identificação (NIF, Nome), dados de contacto (Email, Telefone) e dados de faturação. Também processamos dados de motoristas e viaturas inseridos por si.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Utilização dos Dados</h2>
              <p>Os dados são utilizados exclusivamente para fornecer os serviços da plataforma TVDE Fleet, processar pagamentos via Viva Wallet e sincronizar ganhos com as plataformas Uber e Bolt.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Partilha com Terceiros</h2>
              <p>Não vendemos os seus dados. Partilhamos informações apenas com parceiros essenciais: Viva Wallet (pagamentos), Supabase (armazenamento seguro) e as APIs da Uber/Bolt (sincronização de frotas).</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Segurança</h2>
              <p>Implementamos medidas de segurança técnicas e organizativas para proteger os seus dados, incluindo encriptação SSL e autenticação segura via Supabase Auth.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Os Seus Direitos</h2>
              <p>Tem o direito de aceder, retificar ou eliminar os seus dados pessoais a qualquer momento através das definições da sua conta ou contactando o nosso suporte.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
