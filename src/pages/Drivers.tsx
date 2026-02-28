import React, { useState, useRef, useMemo } from 'react';
import { Plus, Search, Filter, MoreHorizontal, UserCheck, UserX, FileText, Download, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
// @ts-ignore
import { FixedSizeList as List } from 'react-window';
import { cn, formatPercent, formatCurrency } from '../lib/utils';
import DriverDetails from '../components/DriverDetails';
import { Driver } from '../types';
import { useDataStore } from '../store/useDataStore';

const ITEMS_PER_PAGE = 20;

export default function Drivers() {
  const { drivers, addDriver, updateDriver } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'inactive'>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({
    status: 'active',
    commission_type: 'variable',
    commission_value: 25
  });

  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const driver: Driver = {
      id: Math.random().toString(36).substr(2, 9),
      full_name: newDriver.full_name || '',
      nif: newDriver.nif || '',
      iban: newDriver.iban || '',
      phone: newDriver.phone || '',
      email: newDriver.email || '',
      entry_date: new Date().toISOString().split('T')[0],
      status: 'active',
      acceptance_rate: 100,
      cancellation_rate: 0,
      rating_uber: 5.0,
      rating_bolt: 5.0,
      category: 'Economy',
      documents: [],
      commission_type: newDriver.commission_type as any,
      commission_value: newDriver.commission_value || 0
    };
    addDriver(driver);
    setShowAddModal(false);
    alert('Motorista adicionado com sucesso!');
  };

  const toggleDriverStatus = (id: string) => {
    const driver = drivers.find(d => d.id === id);
    if (driver) {
      const newStatus = driver.status === 'active' ? 'suspended' : 'active';
      updateDriver(id, { status: newStatus as any });
      alert(`Motorista ${driver.full_name} agora está ${newStatus === 'active' ? 'Ativo' : 'Suspenso'}.`);
    }
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'NIF', 'Email', 'Telefone', 'Status', 'Comissão', 'Tipo'];
    const rows = filteredDrivers.map(d => [
      d.full_name,
      d.nif,
      d.email,
      d.phone,
      d.status,
      d.commission_value,
      d.commission_type
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'motoristas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch = d.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || d.nif.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  const listRef = useRef<any>(null);

  const getItemSize = (index: number) => {
    const driver = filteredDrivers[index];
    return expandedDriverId === driver?.id ? 320 : 72;
  };

  const handleExpand = (id: string) => {
    setExpandedDriverId(expandedDriverId === id ? null : id);
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  };

  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const driver = filteredDrivers[index];
    if (!driver) return null;

    return (
      <div style={style} className="border-b border-gray-50">
        <div 
          className={cn(
            "flex items-center transition-colors px-4 py-4",
            expandedDriverId === driver.id ? "bg-sidebar/5" : "hover:bg-gray-50"
          )}
          onClick={() => handleExpand(driver.id)}
        >
          <div className="flex-[2] min-w-0 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold shrink-0">
              {driver.full_name.charAt(0)}
            </div>
            <p className="text-sm font-bold truncate">{driver.full_name}</p>
          </div>
          <div className="flex-1 text-sm font-medium text-gray-600 px-2">{driver.nif}</div>
          <div className="flex-1 text-sm text-gray-600 truncate px-2 hidden md:block">{driver.email}</div>
          <div className="flex-1 text-sm text-gray-600 px-2 hidden lg:block">{driver.phone}</div>
          <div className="flex-1 px-2">
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
              driver.status === 'active' ? "bg-emerald-50 text-emerald-700" : 
              driver.status === 'suspended' ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"
            )}>
              {driver.status === 'active' ? 'Ativo' : driver.status === 'suspended' ? 'Suspenso' : 'Inativo'}
            </span>
          </div>
          <div className="flex-1 px-2 hidden xl:block">
            <span className="text-xs font-bold text-gray-600 capitalize">
              {driver.commission_type === 'variable' ? 'Variável' : 'Fixa'}
            </span>
          </div>
          <div className="flex-1 px-2 hidden xl:block">
            <span className="text-xs font-bold text-gray-900">
              {driver.commission_type === 'variable' ? `${driver.commission_value}%` : formatCurrency(driver.commission_value)}
            </span>
          </div>
          <div className="flex-1 text-right">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDriver(driver);
              }}
              className="p-2 text-gray-400 hover:text-sidebar rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
        {expandedDriverId === driver.id && (
          <div className="px-8 py-6 bg-gray-50/50 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dados Bancários</h4>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">IBAN</p>
                  <p className="text-sm font-mono font-bold text-gray-900">{driver.iban}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Comissões</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Tipo</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">{driver.commission_type === 'variable' ? 'Variável (%)' : 'Fixa (EUR)'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Valor</p>
                    <p className="text-sm font-bold text-gray-900">
                      {driver.commission_type === 'variable' ? `${driver.commission_value}%` : formatCurrency(driver.commission_value)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Desempenho</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Aceitação</p>
                    <p className="text-sm font-bold text-emerald-500">{driver.acceptance_rate}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Rating Uber/Bolt</p>
                    <p className="text-sm font-bold text-gray-900">{driver.rating_uber} / {driver.rating_bolt} ★</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Motoristas</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Gerencie sua equipe de motoristas e acompanhe o desempenho.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={exportToCSV}
            className="bg-white text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-sm sm:text-base"
          >
            <Download className="w-4 h-4 sm:w-5 h-5" />
            Exportar CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-sidebar text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 h-5" />
            Novo Motorista
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Adicionar Novo Motorista</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddDriver} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Nome Completo</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sidebar/10 outline-none"
                    onChange={e => setNewDriver({...newDriver, full_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">NIF</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sidebar/10 outline-none"
                    onChange={e => setNewDriver({...newDriver, nif: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Email</label>
                  <input 
                    required type="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sidebar/10 outline-none"
                    onChange={e => setNewDriver({...newDriver, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">IBAN</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sidebar/10 outline-none"
                    onChange={e => setNewDriver({...newDriver, iban: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Tipo de Comissão</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sidebar/10 outline-none"
                    value={newDriver.commission_type}
                    onChange={e => setNewDriver({...newDriver, commission_type: e.target.value as any})}
                  >
                    <option value="variable">Variável (%)</option>
                    <option value="fixed">Fixa (Valor Mensal)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    {newDriver.commission_type === 'variable' ? 'Valor da Comissão (%)' : 'Valor da Comissão (EUR)'}
                  </label>
                  <input 
                    required type="number"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sidebar/10 outline-none"
                    value={newDriver.commission_value}
                    onChange={e => setNewDriver({...newDriver, commission_value: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-sidebar text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-sidebar/20"
                >
                  Salvar Motorista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por nome ou NIF..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sidebar/10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                className="flex-1 sm:flex-none bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-sidebar/10"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                }}
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="suspended">Suspensos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>
          <div className="text-xs text-gray-400 font-medium">
            Exibindo {filteredDrivers.length} motoristas
          </div>
        </div>

        <div className="min-w-[800px]">
          <div className="bg-gray-50/50 flex items-center px-4 py-4 border-b border-gray-100">
            <div className="flex-[2] text-[10px] font-bold uppercase text-gray-400 tracking-wider">Nome</div>
            <div className="flex-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider px-2">NIF</div>
            <div className="flex-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider px-2 hidden md:block">Email</div>
            <div className="flex-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider px-2 hidden lg:block">Telefone</div>
            <div className="flex-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider px-2">Status</div>
            <div className="flex-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider px-2 hidden xl:block">Tipo Comissão</div>
            <div className="flex-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider px-2 hidden xl:block">Valor</div>
            <div className="flex-1 text-[10px] font-bold uppercase text-gray-400 tracking-wider text-right">Ações</div>
          </div>
          
          {filteredDrivers.length > 0 ? (
            <List
              ref={listRef}
              height={600}
              itemCount={filteredDrivers.length}
              itemSize={72}
              width="100%"
              className="scrollbar-hide"
            >
              {Row}
            </List>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-gray-300" />
                <p className="text-gray-500 font-medium">Motorista não encontrado no sistema.</p>
                <p className="text-xs text-gray-400">Tente ajustar a sua pesquisa ou filtros.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination removed for virtualization */}
      
      {selectedDriver && (
        <DriverDetails 
          driver={selectedDriver} 
          onClose={() => setSelectedDriver(null)} 
          onUpdate={(updated) => {
            updateDriver(updated.id, updated);
          }}
        />
      )}
    </div>
  );
}

