import React, { useRef, useState } from 'react';
import { X, Printer, FileText, Shield, Car } from 'lucide-react';
import { Driver, Company } from '../types';
import { cn } from '../lib/utils';

interface DriverContractModalProps {
  driver: Driver;
  company: Company | null;
  onClose: () => void;
}

type ContractType = 'tvde' | 'uber' | 'bolt_comodato';

export default function DriverContractModal({ driver, company, onClose }: DriverContractModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [contractType, setContractType] = useState<ContractType>('tvde');

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir o contrato.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${getContractTitle()} - ${driver.full_name}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #000;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              font-size: 20px;
              text-align: center;
              margin-bottom: 10px;
              color: #003366;
            }
            h2 {
              font-size: 16px;
              text-align: center;
              margin-bottom: 30px;
              color: #003366;
            }
            h3 {
              font-size: 14px;
              margin-top: 25px;
              margin-bottom: 10px;
              color: #003366;
            }
            p {
              font-size: 12px;
              margin-bottom: 10px;
              text-align: justify;
            }
            .bold {
              font-weight: bold;
            }
            .section {
              margin-bottom: 20px;
            }
            .signature-block {
              margin-top: 50px;
            }
            .signature-line {
              border-bottom: 1px solid #000;
              width: 300px;
              margin-bottom: 5px;
            }
            @media print {
              body {
                padding: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getContractTitle = () => {
    switch (contractType) {
      case 'tvde': return 'Contrato de Prestação de Serviços TVDE';
      case 'uber': return 'Autorização de Utilização de Viatura - Uber';
      case 'bolt_comodato': return 'Contrato de Comodato de Viatura - Bolt';
      default: return 'Contrato';
    }
  };

  const renderTVDEContract = () => (
    <>
      <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS TVDE</h1>
      <h2>(REGIME DE TRABALHADOR INDEPENDENTE – COM CEDÊNCIA DE VEÍCULO DE FROTA)</h2>

      <div className="section">
        <p className="bold">ENTRE:</p>
        <p className="bold">PRIMEIRO OUTORGANTE (A EMPRESA):</p>
        <p>
          <span className="bold">{company?.name || '___________________________'}</span>, pessoa coletiva n.º <span className="bold">{company?.nif || '_________'}</span>, com sede na 
          <span className="bold"> {company?.address || '___________________________'}</span>, neste ato representada pelo seu Gerente, 
          doravante designada por <span className="bold">EMPRESA</span>.
        </p>

        <p className="bold" style={{ marginTop: '20px' }}>SEGUNDO OUTORGANTE (O PRESTADOR):</p>
        <p>Nome: <span className="bold">{driver.full_name}</span></p>
        <p>NIF: <span className="bold">{driver.nif}</span> | CC/Passaporte/AR: ____________________________________</p>
        <p>Morada: _________________________________________________________________________</p>
        <p>Carta de Condução: ____________________ | Certificado TVDE: ____________________</p>
        <p>IBAN: <span className="bold">{driver.iban || '__________________________________________________'}</span></p>
        <p>Doravante designado por <span className="bold">PRESTADOR</span>.</p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 1ª – OBJETO, ÂMBITO E LICENCIAMENTO</h3>
        <p>
          O presente contrato regula a prestação de serviços de transporte individual e remunerado de passageiros em veículos descaracterizados (TVDE). O PRESTADOR obriga-se a executar a condução de forma diligente, utilizando as plataformas eletrónicas nas quais a EMPRESA se encontra registada. O PRESTADOR declara possuir certificado de motorista TVDE válido e cumprir todos os requisitos da Lei n.º 45/2018.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 2ª – NATUREZA DA RELAÇÃO E AUTONOMIA</h3>
        <p>
          As partes acordam que este contrato não gera uma relação de trabalho subordinado. O PRESTADOR é um profissional independente, com total autonomia na organização da sua atividade. Não existe subordinação hierárquica, poder disciplinar laboral, nem obrigatoriedade de cumprimento de ordens diretas sobre o modo de execução, desde que respeitados os padrões de segurança previstos na lei.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 3ª – ISENÇÃO TOTAL E ABSOLUTA DE HORÁRIO</h3>
        <p>
          O PRESTADOR exerce a sua atividade em regime de total isenção de horário. Compete-lhe exclusivamente decidir as horas de início e fim da atividade, os dias de trabalho, o tempo de conexão e as pausas para descanso. A EMPRESA não exerce qualquer controlo de assiduidade ou pontualidade.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 4ª – DA CEDÊNCIA E UTILIZAÇÃO ONEROSA DO VEÍCULO</h3>
        <p><span className="bold">4.1. IDENTIFICAÇÃO DO VEÍCULO:</span> Para a execução deste contrato, a EMPRESA cede ao PRESTADOR a utilização do seguinte veículo:</p>
        <ul>
          <li><p>Marca/Modelo: ______________________________________________________</p></li>
          <li><p>Matrícula: ____________________ Ano: __________</p></li>
          <li><p>N.º de Quadro (VIN): ________________________________________________</p></li>
          <li><p>Quilometragem à data de entrega: _________________ km</p></li>
        </ul>
        
        <p><span className="bold">4.2. TAXA DE UTILIZAÇÃO SEMANAL:</span> Pela utilização do veículo e respetivo licenciamento TVDE, o PRESTADOR obriga-se a pagar à EMPRESA o valor semanal fixo de:</p>
        <ul>
          <li><p>Valor: ___________ € (___________________________________________ euros)</p></li>
          <li><p><span className="bold">Método de Pagamento:</span> Este valor será deduzido prioritariamente nos créditos das viagens realizadas pelo PRESTADOR na semana correspondente. Caso o saldo de viagens seja insuficiente, o PRESTADOR obriga-se a liquidar o remanescente por transferência bancária até às 23:59h de cada segunda-feira.</p></li>
        </ul>

        <p><span className="bold">4.3. FIEL DEPÓSITO:</span> O PRESTADOR assume a qualidade de Fiel Depositário do veículo, sendo o único responsável pela sua guarda e conservação. É estritamente proibido o uso do veículo para fins pessoais, transporte de familiares ou cedência a terceiros.</p>
        
        <p><span className="bold">4.4. CUSTOS OPERACIONAIS:</span> Para além da taxa semanal de utilização, são da inteira responsabilidade do PRESTADOR:</p>
        <ul>
          <li><p>a) O custo total do combustível utilizado;</p></li>
          <li><p>b) O pagamento de portagens e taxas SCUT (via identificador ou pagamento direto);</p></li>
          <li><p>c) As despesas de higienização e limpeza diária do veículo.</p></li>
        </ul>

        <p><span className="bold">4.5. MANUTENÇÃO E ZELO:</span> O PRESTADOR obriga-se a verificar diariamente os níveis de óleo e líquido de refrigeração. Qualquer avaria resultante de negligência nestas verificações será considerada culpa do PRESTADOR, sendo este responsável pelo custo total da reparação e pelos dias de imobilização do veículo.</p>
        
        <p><span className="bold">4.6. SINISTROS E DANOS:</span> Em caso de acidente por culpa do PRESTADOR, este pagará o valor da franquia do seguro. Danos estéticos (riscos, amolgadelas) causados durante a posse do veículo e não cobertos pelo seguro serão faturados diretamente ao PRESTADOR.</p>
        
        <p><span className="bold">4.7. RESTITUIÇÃO:</span> O veículo deve ser devolvido nas mesmas condições de limpeza e conservação em que foi entregue. A falta de entrega do veículo no final do contrato confere à EMPRESA o direito de reportar o crime de abuso de confiança às autoridades e proceder à imobilização remota do veículo.</p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 5ª – RESPONSABILIDADE AMPLIADA E USO DO VEÍCULO</h3>
        <p>
          O veículo é para uso <span className="bold">estritamente profissional</span>. É proibida: (a) A utilização para fins pessoais; (b) O transporte de passageiros fora das plataformas; (c) A condução por terceiros. O PRESTADOR assume todos os riscos decorrentes da utilização abusiva do veículo.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 6ª – MANUTENÇÃO, ZELO E NEGLIGÊNCIA MECÂNICA</h3>
        <p>
          O PRESTADOR deve verificar diariamente os níveis de óleo, água, pressão de pneus e luzes. Qualquer sinal de alerta no painel deve ser comunicado imediatamente. A continuação da condução com luzes de aviso acesas que resulte em danos graves será considerada negligência grosseira, sendo o custo da reparação imputado ao PRESTADOR.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 7ª – REMUNERAÇÃO, COMISSÕES E FATURAÇÃO</h3>
        <p>
          A EMPRESA retém uma comissão de <span className="bold">10%</span> sobre o valor bruto das viagens. O PRESTADOR tem direito a <span className="bold">90%</span> do valor bruto, sendo deduzidos os custos operacionais (taxas, combustível e portagens). O pagamento é semanal, mediante apresentação de Recibo Verde.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 8ª – REGULAMENTO DE PENALIZAÇÕES FINANCEIRAS</h3>
        <p>O PRESTADOR autoriza as seguintes deduções em caso de incumprimento:</p>
        <ul>
          <li><p><span className="bold">Fumar no veículo ou falta de limpeza:</span> 50,00 € a 100,00 €.</p></li>
          <li><p><span className="bold">Troca de combustível por erro:</span> Reparação total + 150,00 € (taxa de imobilização).</p></li>
          <li><p><span className="bold">Perda de chave ou documentos:</span> Custo de reposição + 50,00 €.</p></li>
          <li><p><span className="bold">Não comparência em revisões agendadas:</span> 50,00 €.</p></li>
          <li><p><span className="bold">Danos estéticos não comunicados:</span> Valor total da reparação.</p></li>
        </ul>
      </div>

      <div className="section">
        <h3>CLÁUSULA 9ª – MULTAS, CONTRAORDENAÇÕES E PORTAGENS</h3>
        <p>
          O PRESTADOR é o único responsável por todas as coimas. Caso a EMPRESA seja notificada, o PRESTADOR autoriza a dedução do valor da multa acrescido de uma taxa de gestão de <span className="bold">20,00 €</span> por processo.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 10ª – SINISTROS, SEGUROS E FRANQUIAS</h3>
        <p>
          Em caso de acidente com culpa do PRESTADOR, este é responsável pelo pagamento do valor da <span className="bold">franquia do seguro</span>. Em caso de negligência (álcool ou excesso de velocidade), o PRESTADOR responde pelo valor total dos danos não cobertos pela apólice.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 11ª – ÉTICA E IMAGEM DA EMPRESA</h3>
        <p>
          O PRESTADOR deve manter postura profissional e cordial. Comportamentos agressivos, assédio ou discriminação são motivos de rescisão imediata por justa causa.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 12ª – RESPONSABILIDADE FISCAL E SEGURANÇA SOCIAL</h3>
        <p>
          O PRESTADOR é o único responsável pelo pagamento de IRS, IVA (se aplicável) e contribuições para a Segurança Social, devendo manter a sua situação contributiva regularizada.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 13ª – CONFIDENCIALIDADE E RGPD</h3>
        <p>
          É proibida a recolha ou divulgação de dados pessoais de passageiros. O incumprimento do RGPD confere à EMPRESA direito de regresso sobre o PRESTADOR em caso de coimas aplicadas.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 14ª – VIGÊNCIA E RESCISÃO</h3>
        <p>
          O contrato tem a duração de 12 meses, renováveis. Pode ser rescindido por qualquer parte com aviso prévio de 30 dias. A EMPRESA pode rescindir imediatamente em caso de fraude, agressão ou violação grave da lei.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 15ª – COMPENSAÇÃO DE CRÉDITOS E FORO</h3>
        <p>
          O PRESTADOR autoriza a compensação de créditos para cobrir dívidas de multas ou danos. Para qualquer litígio, as partes elegem o foro da Comarca do Seixal.
        </p>
      </div>
    </>
  );

  const renderUberContract = () => (
    <>
      <h1>AUTORIZAÇÃO DE UTILIZAÇÃO DE VIATURA - PLATAFORMA UBER</h1>
      <h2>(PARA EFEITOS DE ADIÇÃO DE VEÍCULO À CONTA DE PARCEIRO)</h2>

      <div className="section">
        <p className="bold">A EMPRESA PARCEIRA:</p>
        <p>
          <span className="bold">{company?.name || '___________________________'}</span>, NIF <span className="bold">{company?.nif || '_________'}</span>, 
          operadora de TVDE licenciada, autoriza o motorista abaixo identificado a utilizar a viatura da sua frota na plataforma Uber.
        </p>

        <p className="bold" style={{ marginTop: '20px' }}>O MOTORISTA:</p>
        <p>Nome: <span className="bold">{driver.full_name}</span></p>
        <p>NIF: <span className="bold">{driver.nif}</span></p>
        <p>Certificado TVDE: ____________________________________</p>
      </div>

      <div className="section">
        <h3>1. IDENTIFICAÇÃO DA VIATURA</h3>
        <p>Marca/Modelo: ______________________________________________________</p>
        <p>Matrícula: ____________________</p>
        <p>VIN: ________________________________________________</p>
      </div>

      <div className="section">
        <h3>2. TERMOS DE UTILIZAÇÃO</h3>
        <p>
          O motorista declara que utilizará a viatura exclusivamente para a prestação de serviços através da plataforma Uber, respeitando todas as normas de segurança e conduta da plataforma e da legislação TVDE em vigor (Lei 45/2018).
        </p>
        <p>
          A empresa parceira garante que o veículo possui todos os seguros obrigatórios (Responsabilidade Civil e Acidentes Pessoais) e inspeção técnica válida para a atividade TVDE.
        </p>
      </div>

      <div className="section">
        <h3>3. RESPONSABILIDADE</h3>
        <p>
          O motorista é responsável por qualquer infração rodoviária cometida durante a utilização do veículo, bem como por danos resultantes de má utilização ou negligência.
        </p>
      </div>
    </>
  );

  const renderBoltContract = () => (
    <>
      <h1>CONTRATO DE COMODATO DE VIATURA</h1>
      <h2>(ATIVIDADE TVDE - PLATAFORMA BOLT)</h2>

      <div className="section">
        <p className="bold">COMODANTE (A EMPRESA):</p>
        <p>
          <span className="bold">{company?.name || '___________________________'}</span>, NIF <span className="bold">{company?.nif || '_________'}</span>, 
          com sede em <span className="bold">{company?.address || '___________________________'}</span>.
        </p>

        <p className="bold" style={{ marginTop: '20px' }}>COMODATÁRIO (O MOTORISTA):</p>
        <p>Nome: <span className="bold">{driver.full_name}</span></p>
        <p>NIF: <span className="bold">{driver.nif}</span></p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 1ª - OBJETO</h3>
        <p>
          O COMODANTE é proprietário/detentor da viatura com a matrícula ____________________, que pelo presente contrato cede, a título gratuito, ao COMODATÁRIO, para que este a utilize no exercício da sua atividade de motorista TVDE.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 2ª - OBRIGAÇÕES DO COMODATÁRIO</h3>
        <p>O COMODATÁRIO obriga-se a:</p>
        <ul>
          <li><p>a) Zelar pela conservação do veículo como se fosse seu;</p></li>
          <li><p>b) Não utilizar o veículo para fins diversos dos previstos;</p></li>
          <li><p>c) Não facultar a utilização do veículo a terceiros;</p></li>
          <li><p>d) Restituir o veículo ao COMODANTE logo que findo o contrato ou solicitado.</p></li>
        </ul>
      </div>

      <div className="section">
        <h3>CLÁUSULA 3ª - MANUTENÇÃO E ENCARGOS</h3>
        <p>
          As despesas correntes de utilização (combustível, limpeza) correm por conta do COMODATÁRIO. As despesas de manutenção estrutural e seguros são da responsabilidade do COMODANTE, salvo se resultantes de má utilização.
        </p>
      </div>

      <div className="section">
        <h3>CLÁUSULA 4ª - DURAÇÃO</h3>
        <p>
          O presente contrato entra em vigor na data da sua assinatura e manter-se-á válido enquanto durar a colaboração entre as partes, podendo ser denunciado a qualquer momento por qualquer uma delas.
        </p>
      </div>
    </>
  );

  const today = new Date();
  const formattedDate = `${today.getDate()} de ${today.toLocaleString('pt-PT', { month: 'long' })} de ${today.getFullYear()}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Gerador de Contratos</h2>
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
              <button 
                onClick={() => setContractType('tvde')}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2",
                  contractType === 'tvde' ? "bg-sidebar text-white" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                TVDE Geral
              </button>
              <button 
                onClick={() => setContractType('uber')}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2",
                  contractType === 'uber' ? "bg-sidebar text-white" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <Car className="w-3.5 h-3.5" />
                Uber (Adição)
              </button>
              <button 
                onClick={() => setContractType('bolt_comodato')}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2",
                  contractType === 'bolt_comodato' ? "bg-sidebar text-white" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <Shield className="w-3.5 h-3.5" />
                Bolt (Comodato)
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-sidebar text-white rounded-lg font-bold hover:bg-black transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 bg-white">
          <div ref={printRef} className="max-w-3xl mx-auto">
            {contractType === 'tvde' && renderTVDEContract()}
            {contractType === 'uber' && renderUberContract()}
            {contractType === 'bolt_comodato' && renderBoltContract()}

            <div className="signature-block">
              <p>Seixal, {formattedDate}.</p>
              
              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p className="bold">{company?.name || 'A EMPRESA'}</p>
                  <div className="signature-line"></div>
                  <p>Assinatura</p>
                </div>
                <div>
                  <p className="bold">O MOTORISTA</p>
                  <div className="signature-line"></div>
                  <p>Assinatura</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
