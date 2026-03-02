import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Shield, Lock, FileText } from 'lucide-react';

export default function Terms() {
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
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Termos de Serviço</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
            <p className="text-sm text-slate-400 italic">Última atualização: 01 de Março de 2026</p>
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Aceitação dos Termos</h2>
              <p>Ao aceder e utilizar a plataforma TVDE Fleet, concorda em cumprir e estar vinculado aos seguintes Termos de Serviço. Se não concordar com qualquer parte destes termos, não deverá utilizar os nossos serviços.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Descrição do Serviço</h2>
              <p>A TVDE Fleet fornece uma plataforma de gestão de frotas (SaaS) para operadores de TVDE em Portugal, incluindo integração com APIs de terceiros (Uber, Bolt), gestão de motoristas, viaturas e processamento de pagamentos.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Assinaturas e Pagamentos</h2>
              <p>O acesso às funcionalidades premium requer uma assinatura ativa. Os pagamentos são processados via Viva Wallet. Reservamo-nos o direito de alterar os preços mediante aviso prévio de 30 dias.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Responsabilidade</h2>
              <p>A TVDE Fleet não se responsabiliza por quaisquer perdas financeiras decorrentes do uso da plataforma ou por falhas nas APIs de terceiros (Uber/Bolt). O utilizador é responsável pela veracidade dos dados inseridos.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Lei Aplicável</h2>
              <p>Estes termos são regidos pelas leis de Portugal. Qualquer litígio será submetido à jurisdição exclusiva dos tribunais da comarca de Lisboa.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
