import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Calendar, 
  Shield, 
  MapPin, 
  CreditCard,
  Download,
  AlertCircle,
  Save,
  Edit2,
  Check,
  Clock
} from 'lucide-react';
import { Driver, DriverDocument } from '../types';
import { cn, formatCurrency } from '../lib/utils';

interface DriverDetailsProps {
  driver: Driver;
  onClose: () => void;
  onUpdate?: (updatedDriver: Driver) => void;
}

export default function DriverDetails({ driver, onClose, onUpdate }: DriverDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDriver, setEditedDriver] = useState<Driver>(driver);
  const [documents, setDocuments] = useState(driver.documents.length > 0 ? driver.documents : [
    { id: '1', type: 'license', label: 'Carta de Condução', expiry: '2028-10-12', status: 'pending' },
    { id: '2', type: 'tvde_cert', label: 'Certificado TVDE', expiry: '2025-05-20', status: 'pending' },
    { id: '3', type: 'id_card', label: 'Cartão de Cidadão', expiry: '2029-01-15', status: 'pending' },
    { id: '4', type: 'address_proof', label: 'Comprovativo Morada', expiry: '2024-12-30', status: 'pending' }
  ]);

  const handleValidateDoc = (docId: string, newStatus: 'valid' | 'rejected') => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, status: newStatus } : doc
    ));
    alert(`Documento ${newStatus === 'valid' ? 'validado' : 'rejeitado'} com sucesso!`);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedDriver);
    }
    setIsEditing(false);
    alert('Motorista atualizado com sucesso!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Válido</span>;
      case 'pending':
        return <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tighter">Pendente</span>;
      case 'expired':
        return <span className="text-[10px] text-red-600 font-bold uppercase tracking-tighter">Expirado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sidebar rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {driver.full_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{driver.full_name}</h2>
              <p className="text-sm text-gray-500">Motorista desde {driver.entry_date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 text-sidebar hover:bg-sidebar/10 rounded-xl transition-all flex items-center gap-2 font-bold text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
            ) : (
              <button 
                onClick={handleSave}
                className="p-2 bg-sidebar text-white hover:bg-black rounded-xl transition-all flex items-center gap-2 font-bold text-sm px-4"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Informações Pessoais</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-medium">Nome Completo</p>
                    {isEditing ? (
                      <input 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={editedDriver.full_name}
                        onChange={e => setEditedDriver({...editedDriver, full_name: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm font-bold">{driver.full_name}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-medium">NIF</p>
                    {isEditing ? (
                      <input 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={editedDriver.nif}
                        onChange={e => setEditedDriver({...editedDriver, nif: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm font-bold">{driver.nif}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-medium">Telefone</p>
                    {isEditing ? (
                      <input 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={editedDriver.phone}
                        onChange={e => setEditedDriver({...editedDriver, phone: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm font-bold">{driver.phone}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-medium">Email</p>
                    {isEditing ? (
                      <input 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={editedDriver.email}
                        onChange={e => setEditedDriver({...editedDriver, email: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm font-bold">{driver.email}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-medium">IBAN</p>
                    {isEditing ? (
                      <input 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={editedDriver.iban}
                        onChange={e => setEditedDriver({...editedDriver, iban: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm font-mono text-[11px] font-bold">{driver.iban}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-medium">Tipo de Comissão</p>
                    {isEditing ? (
                      <select 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={editedDriver.commission_type}
                        onChange={e => setEditedDriver({...editedDriver, commission_type: e.target.value as any})}
                      >
                        <option value="variable">Variável (%)</option>
                        <option value="fixed">Fixa (EUR)</option>
                      </select>
                    ) : (
                      <p className="text-sm font-bold capitalize">{driver.commission_type === 'variable' ? 'Variável (%)' : 'Fixa (EUR)'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-medium">Valor da Comissão</p>
                    {isEditing ? (
                      <input 
                        type="number"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={editedDriver.commission_value}
                        onChange={e => setEditedDriver({...editedDriver, commission_value: Number(e.target.value)})}
                      />
                    ) : (
                      <p className="text-sm font-bold">
                        {driver.commission_type === 'variable' ? `${driver.commission_value}%` : formatCurrency(driver.commission_value)}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Documentação</h3>
                  <button className="text-xs font-bold text-sidebar hover:underline">Validar Todos</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map((doc: any) => (
                    <div 
                      key={doc.id} 
                      className="p-4 border border-gray-100 rounded-2xl flex flex-col gap-3 hover:border-sidebar/20 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-sidebar transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{doc.label}</p>
                            {getStatusBadge(doc.status)}
                          </div>
                        </div>
                        <button 
                          onClick={() => alert(`Iniciando download de: ${doc.label}`)}
                          className="p-2 text-gray-300 hover:text-sidebar transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>Expira em: {doc.expiry}</span>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleValidateDoc(doc.id, 'valid')}
                            className="p-1 text-emerald-500 hover:bg-emerald-50 rounded transition-colors"
                            title="Aprovar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleValidateDoc(doc.id, 'rejected')}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Rejeitar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <h3 className="text-sm font-bold mb-4">Métricas de Desempenho</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">Taxa de Aceitação</span>
                      <span className="font-bold">{driver.acceptance_rate}%</span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${driver.acceptance_rate}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">Taxa de Cancelamento</span>
                      <span className="font-bold">{driver.cancellation_rate}%</span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${driver.cancellation_rate}%` }}></div>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-between border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Uber</p>
                      <p className="text-lg font-bold">{driver.rating_uber} <span className="text-amber-400 text-sm">★</span></p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Bolt</p>
                      <p className="text-lg font-bold">{driver.rating_bolt} <span className="text-amber-400 text-sm">★</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Ações Rápidas</span>
                </div>
                <button 
                  onClick={() => alert(`Motorista ${driver.full_name} suspenso com sucesso.`)}
                  className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Suspender Motorista
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
