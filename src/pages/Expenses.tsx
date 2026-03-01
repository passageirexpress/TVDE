import React, { useState } from 'react';
import { 
  Euro, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Receipt, 
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Edit2,
  Save,
  BarChart as BarChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import Papa from 'papaparse';
import { formatCurrency, cn } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';
import { Expense } from '../types';
import { useDataStore } from '../store/useDataStore';

export default function Expenses() {
  const user = useAuthStore(state => state.user);
  const { expenses, addExpense, updateExpense, drivers: driversData } = useDataStore();
  
  // Calculate totals for the last 30 days
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const categoryTotals = expenses
    .filter(e => new Date(e.date) >= last30Days)
    .reduce((acc, e) => {
      const cat = e.category || 'outros';
      acc[cat] = (acc[cat] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = [
    { name: 'Combustível', value: categoryTotals['combustivel'] || 0, color: '#3b82f6' },
    { name: 'Portagem', value: categoryTotals['portagem'] || 0, color: '#10b981' },
    { name: 'IVA', value: categoryTotals['iva'] || 0, color: '#f59e0b' },
    { name: 'Aluguel', value: categoryTotals['aluguel'] || 0, color: '#8b5cf6' },
    { name: 'Outros', value: categoryTotals['outros'] || 0, color: '#6b7280' },
  ];

  const handleExportCSV = () => {
    const dataToExport = filteredExpenses.map(e => ({
      Data: e.date,
      Categoria: e.category,
      Motorista: driversData.find(d => d.id === e.driver_id)?.full_name || 'Geral',
      Descrição: e.description,
      Valor: e.amount,
      Status: e.status
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `despesas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDate, setFilterDate] = useState({ start: '', end: '' });
  const [formData, setFormData] = useState<Partial<Expense>>({
    category: 'combustivel',
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    driver_id: '',
    amount: 0,
    description: ''
  });

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    
    let matchesDate = true;
    if (filterDate.start) {
      matchesDate = matchesDate && new Date(expense.date) >= new Date(filterDate.start);
    }
    if (filterDate.end) {
      matchesDate = matchesDate && new Date(expense.date) <= new Date(filterDate.end);
    }

    if (user?.role === 'driver') {
      return matchesSearch && matchesCategory && matchesDate && expense.driver_id === user.id;
    }
    return matchesSearch && matchesCategory && matchesDate;
  });

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        category: expense.category,
        amount: expense.amount,
        iva_amount: expense.iva_amount,
        date: expense.date,
        description: expense.description,
        driver_id: expense.driver_id,
        status: expense.status
      });
    } else {
      setEditingExpense(null);
      setFormData({
        category: 'combustivel',
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        driver_id: user?.role === 'driver' ? user.id : '',
        amount: 0,
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.date) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const driverId = user?.role === 'admin' ? formData.driver_id : user?.id;

    if (editingExpense) {
      updateExpense(editingExpense.id, { ...formData, driver_id: driverId });
      alert('Despesa atualizada com sucesso!');
    } else {
      const expense: Expense = {
        id: Math.random().toString(36).substr(2, 9),
        category: formData.category as any,
        amount: Number(formData.amount),
        iva_amount: Number(formData.iva_amount) || 0,
        date: formData.date || '',
        description: formData.description || '',
        status: user?.role === 'admin' ? 'approved' : 'pending',
        driver_id: driverId || ''
      };
      addExpense(expense);
      alert('Despesa registada com sucesso!');
    }
    setShowModal(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'combustivel': return <TrendingDown className="w-4 h-4" />;
      case 'portagem': return <Receipt className="w-4 h-4" />;
      case 'iva': return <Euro className="w-4 h-4" />;
      case 'aluguel': return <FileText className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">Aprovado</span>;
      case 'pending': return <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase">Pendente</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-bold uppercase">Rejeitado</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestão de Gastos</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Registe e acompanhe todas as despesas operacionais.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-sidebar text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 h-5" />
          Nova Despesa
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Combustível', amount: categoryTotals['combustivel'] || 0, color: 'bg-blue-500' },
          { label: 'Portagens', amount: categoryTotals['portagem'] || 0, color: 'bg-emerald-500' },
          { label: 'IVA', amount: categoryTotals['iva'] || 0, color: 'bg-amber-500' },
          { label: 'Aluguel', amount: categoryTotals['aluguel'] || 0, color: 'bg-purple-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold mt-2">{formatCurrency(stat.amount)}</p>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", stat.color)} style={{ width: '60%' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart Section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <BarChartIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Despesas por Categoria (Últimos 30 dias)</h3>
            <p className="text-xs text-gray-400">Distribuição total dos gastos operacionais.</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#9ca3af'}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#9ca3af'}}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip 
                cursor={{fill: '#f9fafb'}}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                }}
                formatter={(value: number) => [formatCurrency(value), 'Total']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold">Histórico de Despesas</h3>
            <div className="flex gap-2">
              <button 
                onClick={handleExportCSV}
                className="p-2 text-gray-400 hover:text-sidebar transition-colors"
                title="Exportar CSV"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Procurar descrição..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sidebar/10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sidebar/10"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Todas as Categorias</option>
              <option value="combustivel">Combustível</option>
              <option value="portagem">Portagem</option>
              <option value="iva">IVA</option>
              <option value="aluguel">Aluguel</option>
              <option value="outros">Outros</option>
            </select>

            <div className="flex items-center gap-2">
              <input 
                type="date" 
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] outline-none focus:ring-2 focus:ring-sidebar/10"
                value={filterDate.start}
                onChange={(e) => setFilterDate({...filterDate, start: e.target.value})}
              />
              <span className="text-gray-400 text-[10px]">até</span>
              <input 
                type="date" 
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] outline-none focus:ring-2 focus:ring-sidebar/10"
                value={filterDate.end}
                onChange={(e) => setFilterDate({...filterDate, end: e.target.value})}
              />
            </div>

            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterDate({ start: '', end: '' });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">Data</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">Categoria</th>
                {user?.role === 'admin' && <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">Motorista</th>}
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">Descrição</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">Valor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{expense.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500">
                          {getCategoryIcon(expense.category)}
                        </div>
                        <span className="text-sm font-bold capitalize">{expense.category}</span>
                      </div>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {driversData.find(d => d.id === expense.driver_id)?.full_name || 'Geral'}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-500">{expense.description}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(expense.amount)}</td>
                    <td className="px-6 py-4">{getStatusBadge(expense.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(expense)}
                          className="p-2 text-gray-400 hover:text-sidebar transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => alert('Visualizando comprovativo da despesa...')}
                          className="p-2 text-gray-400 hover:text-sidebar transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {user?.role === 'admin' && expense.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => {
                                updateExpense(expense.id, { status: 'approved' });
                                alert('Despesa aprovada!');
                              }}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                updateExpense(expense.id, { status: 'rejected' });
                                alert('Despesa rejeitada!');
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                    Nenhuma despesa ou motorista encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {user?.role === 'admin' ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Motorista</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.driver_id}
                    onChange={e => setFormData({...formData, driver_id: e.target.value})}
                    required
                  >
                    <option value="">Selecione um motorista...</option>
                    <option value="all">Geral (Frota)</option>
                    {driversData.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Motorista</label>
                  <input 
                    type="text" 
                    disabled 
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium"
                    value={driversData.find(d => d.id === user?.id)?.full_name || user?.full_name || ''}
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                >
                  <option value="combustivel">Combustível</option>
                  <option value="portagem">Portagem</option>
                  <option value="iva">IVA</option>
                  <option value="aluguel">Aluguel</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              {(formData.category === 'outros' || formData.category === 'iva') && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Valor do IVA (EUR)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                    value={formData.iva_amount}
                    onChange={e => setFormData({...formData, iva_amount: Number(e.target.value)})}
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Valor (EUR)</label>
                <input 
                  type="number" step="0.01" required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Data</label>
                <input 
                  type="date" required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Descrição</label>
                <textarea 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-sidebar/10 min-h-[100px]"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-sidebar text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-sidebar/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingExpense ? 'Salvar Alterações' : 'Registar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
