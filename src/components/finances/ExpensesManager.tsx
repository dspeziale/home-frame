import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';
import { 
  Receipt, 
  Euro, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Paperclip, 
  Trash2, 
  Tag, 
  CreditCard,
  PieChart as PieChartIcon
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { exportToCSV } from '../../lib/exportUtils';

const CATEGORY_COLORS: Record<string, string> = {
  'Carburante': '#f59e0b',
  'Autostrada e parcheggi': '#fbbf24',
  'Attrezzatura fotografica': '#3b82f6',
  'Manutenzione attrezzatura': '#6366f1',
  'Software e abbonamenti': '#8b5cf6',
  'Collaboratori': '#ec4899',
  'Pubblicità': '#10b981',
  'Altre spese': '#64748b'
};

export const ExpensesManager: React.FC = () => {
  const { 
    expenses, 
    setIsExpenseModalOpen, 
    setEditingExpense, 
    deleteExpense,
    expenseCategories,
    jobs 
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchSearch = exp.description.toLowerCase().includes(search.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(search.toLowerCase()));

      const matchCategory = selectedCategory === 'all' || exp.category === selectedCategory;
      const matchMonth = monthFilter === 'all' || exp.date.startsWith(monthFilter);

      return matchSearch && matchCategory && matchMonth;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, search, selectedCategory, monthFilter]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // Breakdown per categoria
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const handleExportCSV = () => {
    const data = filteredExpenses.map(e => ({
      ID: e.id,
      Data: e.date,
      Descrizione: e.description,
      Importo: e.amount,
      Categoria: e.category,
      Metodo_Pagamento: e.paymentMethod,
      Ricevuta: e.receiptName || '',
      Note: e.notes || ''
    }));
    exportToCSV(data, `Spese_Gestionale_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Gestione Spese & Costi ({filteredExpenses.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitoraggio costi vivi: trasferte, carburante, attrezzatura, licenze software
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Esporta per Commercialista</span>
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-500/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registra Spesa</span>
          </button>
        </div>
      </div>

      {/* RIEPILOGO STATISTICHE SPESE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Box Totale Spese */}
        <div className="p-6 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">
              Totale Spese Filtrate
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold mt-1">
              € {totalAmount.toFixed(2)}
            </h3>
            <p className="text-xs opacity-90 mt-2">
              Include {filteredExpenses.length} registrazioni di costo
            </p>
          </div>

          <div className="pt-4 border-t border-amber-400/40 mt-4 flex items-center justify-between text-xs font-medium">
            <span>Categoria principale:</span>
            <span className="font-bold">{categoryData[0]?.name || 'N/D'}</span>
          </div>
        </div>

        {/* Grafico Ripartizione Spese */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-1/2 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`€ ${Number(val).toFixed(2)}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full sm:w-1/2 space-y-1.5 max-h-52 overflow-y-auto pr-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              Ripartizione Spese
            </span>
            {categoryData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5 truncate text-slate-700 dark:text-slate-300">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#94a3b8' }}
                  />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0">
                  € {item.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barra Ricerca e Filtri */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cerca descrizione spesa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="all">Tutte le categorie</option>
            {expenseCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="month"
            value={monthFilter === 'all' ? '' : monthFilter}
            onChange={e => setMonthFilter(e.target.value || 'all')}
            className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Tabella Spese */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">Data</th>
                <th className="p-4">Descrizione</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Metodo Pagamento</th>
                <th className="p-4">Ricevuta</th>
                <th className="p-4 text-right">Importo</th>
                <th className="p-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Nessuna spesa registrata con i criteri selezionati.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr
                    key={exp.id}
                    onClick={() => {
                      setEditingExpense(exp);
                      setIsExpenseModalOpen(true);
                    }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{exp.description}</p>
                      {exp.notes && (
                        <p className="text-[11px] text-slate-400 italic truncate max-w-xs">{exp.notes}</p>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span 
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white"
                        style={{ backgroundColor: CATEGORY_COLORS[exp.category] || '#64748b' }}
                      >
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {exp.paymentMethod}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {exp.receiptName ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <Paperclip className="w-3.5 h-3.5" /> Allegata
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap font-bold text-slate-900 dark:text-slate-100 text-sm">
                      € {exp.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          if (confirm('Eliminare questa spesa?')) deleteExpense(exp.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Elimina"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
