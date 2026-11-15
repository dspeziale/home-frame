import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DeliveryItem, DeliveryStatus } from '../../types';
import { 
  X, 
  PackageCheck, 
  Calendar, 
  MapPin, 
  FolderDown, 
  FileText, 
  ExternalLink, 
  AlertTriangle,
  Clock,
  Trash2
} from 'lucide-react';

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, { label: string; badge: string }> = {
  'da_preparare': { label: 'Da preparare', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  'in_lavorazione': { label: 'In lavorazione', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  'pronto': { label: 'Pronto per la consegna', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  'consegnato': { label: 'Consegnato', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  'in_attesa_modifiche': { label: 'In attesa di modifiche', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  'modifiche_richieste': { label: 'Modifiche richieste', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  'nuova_consegna_effettuata': { label: 'Nuova consegna effettuata', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
};

export const DeliveryModal: React.FC = () => {
  const { 
    isDeliveryModalOpen, 
    setIsDeliveryModalOpen, 
    editingDelivery, 
    setEditingDelivery, 
    addDelivery, 
    updateDelivery, 
    deleteDelivery,
    jobs 
  } = useApp();

  const [formData, setFormData] = useState({
    jobId: '',
    clientName: '',
    agency: '',
    propertyAddress: '',
    shootDate: new Date().toISOString().split('T')[0],
    targetDeliveryDate: new Date().toISOString().split('T')[0],
    actualDeliveryDate: '',
    cloudFolderUrl: '',
    materialDelivered: '25 fotografie HDR',
    status: 'da_preparare' as DeliveryStatus,
    notes: '',
  });

  useEffect(() => {
    if (editingDelivery) {
      setFormData({
        jobId: editingDelivery.jobId,
        clientName: editingDelivery.clientName,
        agency: editingDelivery.agency || '',
        propertyAddress: editingDelivery.propertyAddress,
        shootDate: editingDelivery.shootDate,
        targetDeliveryDate: editingDelivery.targetDeliveryDate,
        actualDeliveryDate: editingDelivery.actualDeliveryDate || '',
        cloudFolderUrl: editingDelivery.cloudFolderUrl || '',
        materialDelivered: editingDelivery.materialDelivered,
        status: editingDelivery.status,
        notes: editingDelivery.notes || '',
      });
    }
  }, [editingDelivery]);

  if (!isDeliveryModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.propertyAddress.trim()) {
      alert('Inserisci il nome del cliente e l\'indirizzo dell\'immobile.');
      return;
    }

    if (editingDelivery) {
      updateDelivery(editingDelivery.id, formData);
    } else {
      addDelivery(formData);
    }

    setIsDeliveryModalOpen(false);
    setEditingDelivery(null);
  };

  const handleDelete = () => {
    if (editingDelivery && confirm('Sei sicuro di voler eliminare questa consegna?')) {
      deleteDelivery(editingDelivery.id);
      setIsDeliveryModalOpen(false);
      setEditingDelivery(null);
    }
  };

  // Mark as delivered today
  const handleMarkAsDelivered = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      status: 'consegnato',
      actualDeliveryDate: today
    }));
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = formData.status !== 'consegnato' && formData.status !== 'nuova_consegna_effettuata' && formData.targetDeliveryDate < todayStr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-float border border-slate-200 dark:border-slate-800 my-auto overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-amber-500" />
              {editingDelivery ? 'Modifica Scheda Consegna' : 'Nuova Consegna'}
            </h2>
            <p className="text-xs text-slate-500">
              Gestione scadenze, link di download e revisioni clienti
            </p>
          </div>

          <div className="flex items-center gap-2">
            {editingDelivery && (
              <button
                type="button"
                onClick={handleDelete}
                title="Elimina consegna"
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => {
                setIsDeliveryModalOpen(false);
                setEditingDelivery(null);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Overdue alert banner if late */}
          {isOverdue && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center gap-2 text-red-700 dark:text-red-300 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>Attenzione: consegna in ritardo rispetto alla scadenza ({formData.targetDeliveryDate})!</span>
            </div>
          )}

          {/* Dati Cliente e Immobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cliente / Referente *
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Agenzia
              </label>
              <input
                type="text"
                value={formData.agency}
                onChange={e => setFormData({ ...formData, agency: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Indirizzo Immobile *
            </label>
            <input
              type="text"
              required
              value={formData.propertyAddress}
              onChange={e => setFormData({ ...formData, propertyAddress: e.target.value })}
              className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date Realizzazione, Prevista ed Effettiva */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data Servizio *
              </label>
              <input
                type="date"
                required
                value={formData.shootDate}
                onChange={e => setFormData({ ...formData, shootDate: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data Prevista Consegna *
              </label>
              <input
                type="date"
                required
                value={formData.targetDeliveryDate}
                onChange={e => setFormData({ ...formData, targetDeliveryDate: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data Effettiva Consegna
              </label>
              <input
                type="date"
                value={formData.actualDeliveryDate}
                onChange={e => setFormData({ ...formData, actualDeliveryDate: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* STATO CONSEGNA (I 7 STATI RICHIESTI) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Stato della Consegna *
              </label>
              <button
                type="button"
                onClick={handleMarkAsDelivered}
                className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Segna come consegnato oggi
              </button>
            </div>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as DeliveryStatus })}
              className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="da_preparare">Da preparare</option>
              <option value="in_lavorazione">In lavorazione</option>
              <option value="pronto">Pronto per la consegna</option>
              <option value="consegnato">Consegnato</option>
              <option value="in_attesa_modifiche">In attesa di modifiche</option>
              <option value="modifiche_richieste">Modifiche richieste</option>
              <option value="nuova_consegna_effettuata">Nuova consegna effettuata</option>
            </select>
          </div>

          {/* Link Drive / Dropbox */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Link Cartella Fotografie & Video (Google Drive / Dropbox / WeTransfer)
              </label>
              {formData.cloudFolderUrl && (
                <a
                  href={formData.cloudFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3 h-3" /> Apri cartella
                </a>
              )}
            </div>
            <div className="relative">
              <FolderDown className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                placeholder="https://drive.google.com/drive/folders/... oppure Dropbox"
                value={formData.cloudFolderUrl}
                onChange={e => setFormData({ ...formData, cloudFolderUrl: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Materiale consegnato & Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tipologia Materiale Consegnato
            </label>
            <input
              type="text"
              placeholder="Es. 32 Foto HDR (Web + Stampa) + 1 Reel Verticale 4K"
              value={formData.materialDelivered}
              onChange={e => setFormData({ ...formData, materialDelivered: e.target.value })}
              className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Note & Feedback Cliente
            </label>
            <textarea
              rows={2}
              placeholder="Annotazioni sulla consegna o richieste di ritocco..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsDeliveryModalOpen(false);
                setEditingDelivery(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-md shadow-amber-500/30 transition-all"
            >
              {editingDelivery ? 'Salva Consegna' : 'Crea Consegna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
