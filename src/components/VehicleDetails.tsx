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
  Clock,
  Upload,
  Loader2,
  Car
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useDataStore } from '../store/useDataStore';

interface VehicleDetailsProps {
  vehicle: any;
  onClose: () => void;
  onUpdate?: (updatedVehicle: any) => void;
}

export default function VehicleDetails({ vehicle, onClose, onUpdate }: VehicleDetailsProps) {
  const { uploadDocument, drivers } = useDataStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [editedVehicle, setEditedVehicle] = useState<any>(vehicle);
  const [documents, setDocuments] = useState(vehicle.documents?.length > 0 ? vehicle.documents : [
    { id: 'v1', vehicle_id: vehicle.id, type: 'insurance', label: 'Seguro Automóvel', expiry_date: vehicle.insurance_expiry || '', status: 'pending', url: '#' },
    { id: 'v2', vehicle_id: vehicle.id, type: 'inspection', label: 'Inspeção Periódica (IPO)', expiry_date: vehicle.inspection_expiry || '', status: 'pending', url: '#' },
    { id: 'v3', vehicle_id: vehicle.id, type: 'registration', label: 'Documento Único Automóvel', expiry_date: '', status: 'pending', url: '#' },
    { id: 'v4', vehicle_id: vehicle.id, type: 'tvde_license', label: 'Licença TVDE da Viatura', expiry_date: '', status: 'pending', url: '#' }
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(docId);
    try {
      const url = await uploadDocument(file, `vehicles/${vehicle.id}/${docId}_${file.name}`);
      setDocuments((prev: any[]) => prev.map(doc => 
        doc.id === docId ? { ...doc, url, status: 'pending' } : doc
      ));
      alert('Documento enviado com sucesso!');
    } catch (error: any) {
      alert('Erro ao enviar documento: ' + error.message);
    } finally {
      setIsUploading(null);
    }
  };

  const handleValidateDoc = async (docId: string, newStatus: 'valid' | 'rejected') => {
    const notes = prompt(`Notas para o documento (${newStatus === 'valid' ? 'Aprovação' : 'Rejeição'}):`);
    
    try {
      const response = await fetch('/api/documents/review', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb-access-token')}`
        },
        body: JSON.stringify({
          documentId: docId,
          status: newStatus,
          type: 'vehicle',
          notes
        })
      });

      if (!response.ok) throw new Error('Falha ao atualizar status do documento');

      setDocuments((prev: any[]) => prev.map(doc => 
        doc.id === docId ? { ...doc, status: newStatus } : doc
      ));
      alert(`Documento ${newStatus === 'valid' ? 'validado' : 'rejeitado'} com sucesso!`);
    } catch (error: any) {
      alert('Erro: ' + error.message);
    }
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedVehicle);
    }
    setIsEditing(false);
    alert('Veículo atualizado com sucesso!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Válido</span>;
      case 'pending':
        return <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tighter">Pendente</span>;
      case 'expired':
        return <span className="text-[10px] text-red-600 font-bold uppercase tracking-tighter">Expirado</span>;
      case 'rejected':
        return <span className="text-[10px] text-red-600 font-bold uppercase tracking-tighter">Rejeitado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-sidebar rounded-2xl flex items-center justify-center text-white">
              <Car className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase">{vehicle.brand} {vehicle.model}</h2>
              <p className="text-sm text-gray-500 font-mono">{vehicle.plate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sidebar hover:bg-sidebar/10 rounded-xl transition-all flex items-center gap-2 font-bold text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
            ) : (
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-sidebar text-white hover:bg-black rounded-xl transition-all flex items-center gap-2 font-bold text-sm"
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
            <div className="md:col-span-2 space-y-10">
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Especificações Técnicas</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Marca / Fabricante</p>
                    {isEditing ? (
                      <input 
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={editedVehicle.brand}
                        onChange={e => setEditedVehicle({...editedVehicle, brand: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm font-bold">{vehicle.brand}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Modelo / Versão</p>
                    {isEditing ? (
                      <input 
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={editedVehicle.model}
                        onChange={e => setEditedVehicle({...editedVehicle, model: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm font-bold">{vehicle.model}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Matrícula (Portugal)</p>
                    {isEditing ? (
                      <input 
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={editedVehicle.plate}
                        onChange={e => setEditedVehicle({...editedVehicle, plate: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm font-mono font-bold">{vehicle.plate}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Motorista Atual</p>
                    {isEditing ? (
                      <select 
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sidebar/10"
                        value={editedVehicle.current_driver_id}
                        onChange={e => setEditedVehicle({...editedVehicle, current_driver_id: e.target.value})}
                      >
                        <option value="">Ninguém</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>{d.full_name}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm font-bold">
                        {drivers.find(d => d.id === vehicle.current_driver_id)?.full_name || 'Ninguém'}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Documentação Obrigatória</h3>
                  <button className="text-[10px] font-black text-sidebar uppercase tracking-widest hover:underline">Histórico de Docs</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map((doc: any) => (
                    <div 
                      key={doc.id} 
                      className="p-5 border border-gray-100 rounded-3xl flex flex-col gap-4 hover:border-sidebar/20 transition-all group bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-sidebar transition-colors">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black tracking-tight">{doc.label}</p>
                            {getStatusBadge(doc.status)}
                          </div>
                        </div>
                        <button 
                          onClick={() => alert(`Iniciando download de: ${doc.label}`)}
                          className="p-2 text-gray-300 hover:text-sidebar transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Expira: {doc.expiry_date || 'N/A'}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <label className="p-2 text-sidebar hover:bg-sidebar/10 rounded-xl transition-all cursor-pointer">
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, doc.id)}
                              disabled={isUploading === doc.id}
                            />
                            {isUploading === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                          </label>
                          <button 
                            onClick={() => handleValidateDoc(doc.id, 'valid')}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Aprovar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleValidateDoc(doc.id, 'rejected')}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Rejeitar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl text-white">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6">Status Operacional</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/60">Estado Atual</span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      vehicle.status === 'active' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                    )}>
                      {vehicle.status === 'active' ? 'Em Operação' : 'Manutenção'}
                    </span>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Próxima Revisão</p>
                    <p className="text-xl font-bold">{vehicle.inspection_expiry || 'Não agendada'}</p>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Seguro Ativo até</p>
                    <p className="text-xl font-bold">{vehicle.insurance_expiry || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-red-600 mb-6">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Zona de Risco</span>
                </div>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">Ações críticas que afetam a disponibilidade da viatura na frota.</p>
                <button 
                  onClick={() => alert(`Viatura ${vehicle.plate} marcada para manutenção.`)}
                  className="w-full py-4 bg-red-50 text-red-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                  Imobilizar Viatura
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
