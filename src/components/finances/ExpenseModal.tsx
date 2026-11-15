import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import { 
  X, 
  Receipt, 
  Euro, 
  Calendar, 
  Tag, 
  CreditCard, 
  Paperclip, 
  FileText, 
  Trash2,
  CheckCircle2
} from 'lucide-react';

export const ExpenseModal: React.FC = () => {
  const { 
    isExpenseModalOpen, 
    setIsExpenseModalOpen, 
    editingExpense, 
    setEditingExpense, 
    addExpense, 
    updateExpense, 
    deleteExpense,
    expenseCategories,
    jobs
  } = useApp();

  const [formData, setFormData] = useState({
    description: '',
    amount: 50,
    date: new Date().toISOString().split('T')[0],
    category: 'Carburante' as ExpenseCategory,
    paymentMethod: 'Carta' as PaymentMethod,
    jobId: '',
    receiptName: '',
    notes: '',
  });

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        description: editingExpense.description,
        amount: editingExpense.amount,
        date: editingExpense.date,
        category: editingExpense.category,
        paymentMethod: editingExpense.paymentMethod,
        jobId: editingExpense.jobId || '',
        receiptName: editingExpense.receiptName || '',
        notes: editingExpense.notes || '',
      });
    } else {
      setFormData({
        description: '',
        amount: 35,
        date: new Date().toISOString().split('T')[0],
        category: expenseCategories[0] || 'Carburante',
        paymentMethod: 'Carta',
        jobId: '',
        receiptName: '',
        notes: '',
      });
    }
  }, [editingExpense, expenseCategories]);

  if (!isExpenseModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.amount <= 0) {
      alert('Inserisci una descrizione e un importo valido.');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, formData);
    } else {
      addExpense(formData);
    }

    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleDelete = () => {
    if (editingExpense && confirm('Sei sicuro di voler eliminare questa spesa?')) {
      deleteExpense(editingExpense.id);
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        receiptName: file.name
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-float border border-slate-200 dark:border-slate-800 my-auto overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-500" />
              {editingExpense ? 'Modifica Spesa' : 'Registra Nuova Spesa'}
            </h2>
            <p className="text-xs text-slate-500">
              Gestione costi vivi, carburante, attrezzatura e abbonamenti
            </p>
          </div>

          <div className="flex items-center gap-2">
            {editingExpense && (
              <button
                type="button"
                onClick={handleDelete}
                title="Elimina spesa"
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => {
                setIsExpenseModalOpen(false);
                setEditingExpense(null);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Descrizione */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrizione Spesa *
            </label>
            <input
              type="text"
              required
              placeholder="Es. Pieno benzina per servizio a Monza, Scheda SD, Abbonamento Adobe..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Importo e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Importo Spesa (€) *
              </label>
              <div className="relative">
                <Euro className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0.01"
                  step="0.10"
                  required
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data Spesa *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Categoria e Metodo Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500"
              >
                {expenseCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Metodo di Pagamento *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
              >
                <option value="Carta">Carta di Credito / Bancomat</option>
                <option value="Bonifico">Bonifico Bancario</option>
                <option value="Contanti">Contanti</option>
                <option value="PayPal / Stripe">PayPal / Stripe</option>
                <option value="Altro">Altro</option>
              </select>
            </div>
          </div>

          {/* Lavoro Collegato (Opzionale) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Collega a Lavoro Specifico (Opzionale)
            </label>
            <select
              value={formData.jobId}
              onChange={e => setFormData({ ...formData, jobId: e.target.value })}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Nessun lavoro collegato (Spesa generale) --</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.shootDate} - {j.propertyAddress} ({j.clientName})
                </option>
              ))}
            </select>
          </div>

          {/* Allegato Ricevuta / Scontrino */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ricevuta / Scontrino Fiscale
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span>{formData.receiptName ? 'Cambia file' : 'Carica foto ricevuta'}</span>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
              {formData.receiptName && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-[200px]">{formData.receiptName}</span>
                  <button 
                    type="button" 
                    onClick={() => setFormData(p => ({ ...p, receiptName: '' }))}
                    className="p-1 hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Note Aggiuntive
            </label>
            <textarea
              rows={2}
              placeholder="Dettagli fornitore, chilometri percorsi, note fiscali..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsExpenseModalOpen(false);
                setEditingExpense(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-md shadow-amber-500/30 transition-all"
            >
              {editingExpense ? 'Salva Modifiche' : 'Registra Spesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
