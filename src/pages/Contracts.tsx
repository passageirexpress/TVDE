import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download,
  ExternalLink,
  Plus,
  MoreVertical,
  Car,
  Zap
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { Driver, Contract } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function Contracts() {
  const { drivers, contracts, addContract, updateContract } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tvde' | 'uber' | 'bolt'>('all');

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getContractStatus = (driverId: string, type: string) => {
    // This is a simplified logic. In a real app, you'd have more specific fields or a separate table for platform associations.
    // For now, we'll use the existing contracts table and some mock logic for Uber/Bolt if not present.
    const contract = contracts.find(c => c.driver_id === driverId && c.type === type);
    if (contract) return contract.status;
    
    // Mocking some statuses for the UI if no real contract exists yet
    return 'none';
  };

  const statusConfig = {
    signed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Assinado' },
    sent: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Enviado' },
    expired: { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Expirado' },
    none: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Pendente' },
    draft: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Rascunho' },
  };

  const handleAction = (driverName: string, action: string) => {
    toast.success(`${action} para ${driverName} concluído com sucesso!`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Gestão de Contratos</h1>
          <p className="text-gray-500 mt-1">Visualize e gira os contratos TVDE e associações Uber/Bolt dos seus motoristas.</p>
        </div>
        <button 
          onClick={() => toast.info('Funcionalidade de criação em massa em breve!')}
          className="bg-sidebar text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-sidebar/20"
        >
          <Plus className="w-5 h-5" />
          Novo Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Assinados</span>
          </div>
          <div className="text-3xl font-black tracking-tighter">
            {contracts.filter(c => c.status === 'signed').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pendentes</span>
          </div>
          <div className="text-3xl font-black tracking-tighter">
            {drivers.length * 3 - contracts.filter(c => c.status === 'signed').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Expirados</span>
          </div>
          <div className="text-3xl font-black tracking-tighter">
            {contracts.filter(c => c.status === 'expired').length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar motorista..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-sidebar/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Motorista</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contrato TVDE</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assoc. Uber</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assoc. Bolt</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDrivers.map((driver) => {
                const tvdeStatus = getContractStatus(driver.id, 'tvde_contract');
                const uberStatus = getContractStatus(driver.id, 'uber_association') as any || 'none';
                const boltStatus = getContractStatus(driver.id, 'bolt_association') as any || 'none';

                return (
                  <tr key={driver.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sidebar/5 rounded-xl flex items-center justify-center text-sidebar font-bold">
                          {driver.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{driver.full_name}</div>
                          <div className="text-xs text-gray-400">{driver.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tvdeStatus as any} config={statusConfig} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={uberStatus} config={statusConfig} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={boltStatus} config={statusConfig} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleAction(driver.full_name, 'Envio de contrato')}
                          className="p-2 text-gray-400 hover:text-sidebar hover:bg-sidebar/5 rounded-lg transition-all"
                          title="Enviar Contrato"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleAction(driver.full_name, 'Download de PDF')}
                          className="p-2 text-gray-400 hover:text-sidebar hover:bg-sidebar/5 rounded-lg transition-all"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-sidebar hover:bg-sidebar/5 rounded-lg transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, config }: { status: keyof typeof config, config: any }) {
  const item = config[status] || config.none;
  const Icon = item.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
      item.bg,
      item.color
    )}>
      <Icon className="w-3.5 h-3.5" />
      {item.label}
    </div>
  );
}
