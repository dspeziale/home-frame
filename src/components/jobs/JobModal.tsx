import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, JobStatus, PropertyType, ServiceType, PaymentMethod, PaymentStatus } from '../../types';
import { 
  X, 
  Briefcase, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Camera, 
  Video, 
  FolderDown, 
  Euro, 
  FileText, 
  CheckCircle2, 
  PhoneCall, 
  ExternalLink,
  Printer,
  Trash2
} from 'lucide-react';
import { generateJobPDF } from '../../lib/exportUtils';

export const JOB_STATUS_LABELS: Record<JobStatus, { label: string; step: number; color: string; badgeBg: string }> = {
  '1_confermato': { label: '1. Appuntamento confermato', step: 1, color: 'text-blue-600', badgeBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  '2_da_effettuare': { label: '2. Da effettuare', step: 2, color: 'text-indigo-600', badgeBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
  '3_effettuato': { label: '3. Servizio effettuato', step: 3, color: 'text-cyan-600', badgeBg: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' },
  '4_selezione': { label: '4. Materiale da selezionare', step: 4, color: 'text-amber-600', badgeBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  '5_editing': { label: '5. In fase di editing', step: 5, color: 'text-purple-600', badgeBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  '6_pronto': { label: '6. Pronto per la consegna', step: 6, color: 'text-emerald-600', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
  '7_consegnato': { label: '7. Consegnato', step: 7, color: 'text-teal-600', badgeBg: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' },
  '8_completato_pagato': { label: '8. Completato e pagato', step: 8, color: 'text-green-600', badgeBg: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
};

export const JobModal: React.FC = () => {
  const { 
    isJobModalOpen, 
    setIsJobModalOpen, 
    editingJob, 
    setEditingJob, 
    addJob, 
    updateJob, 
    deleteJob,
    businessProfile,
    users,
    setPhotoGalleryJob
  } = useApp();

  const [formData, setFormData] = useState({
    clientName: '',
    agency: '',
    phone: '',
    email: '',
    propertyAddress: '',
    shootDate: new Date().toISOString().split('T')[0],
    propertyType: 'Appartamento' as PropertyType,
    serviceType: 'Servizio fotografico' as ServiceType,
    expectedPhotos: 25,
    expectedVideos: 0,
    workNotes: '',
    targetDeliveryDate: new Date().toISOString().split('T')[0],
    actualDeliveryDate: '',
    cloudFolderUrl: '',
    coverPhotoUrl: '',
    notes: '',
    status: '2_da_effettuare' as JobStatus,
    assignedPhotographerId: '',
    assignedEditorId: '',
    price: 220,
    deposit: 0,
    paymentMethod: 'Bonifico' as PaymentMethod,
    paymentStatus: 'in_attesa_saldo' as PaymentStatus,
    paymentDate: '',
  });

  useEffect(() => {
    if (editingJob) {
      setFormData({
        clientName: editingJob.clientName,
        agency: editingJob.agency || '',
        phone: editingJob.phone,
        email: editingJob.email,
        propertyAddress: editingJob.propertyAddress,
        shootDate: editingJob.shootDate,
        propertyType: editingJob.propertyType,
        serviceType: editingJob.serviceType,
        expectedPhotos: editingJob.expectedPhotos,
        expectedVideos: editingJob.expectedVideos,
        workNotes: editingJob.workNotes || '',
        targetDeliveryDate: editingJob.targetDeliveryDate,
        actualDeliveryDate: editingJob.actualDeliveryDate || '',
        cloudFolderUrl: editingJob.cloudFolderUrl || '',
        coverPhotoUrl: editingJob.coverPhotoUrl || '',
        notes: editingJob.notes || '',
        status: editingJob.status,
        assignedPhotographerId: editingJob.assignedPhotographerId || '',
        assignedEditorId: editingJob.assignedEditorId || '',
        price: editingJob.price,
        deposit: editingJob.deposit,
        paymentMethod: editingJob.paymentMethod,
        paymentStatus: editingJob.paymentStatus,
        paymentDate: editingJob.paymentDate || '',
      });
    }
  }, [editingJob]);

  if (!isJobModalOpen) return null;

  const currentBalance = Math.max(0, formData.price - formData.deposit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.propertyAddress.trim()) {
      alert('Inserisci il nome del cliente e l\'indirizzo dell\'immobile.');
      return;
    }

    if (editingJob) {
      updateJob(editingJob.id, {
        ...formData,
        balance: currentBalance,
      });
    } else {
      addJob({
        ...formData,
        balance: currentBalance,
      });
    }

    setIsJobModalOpen(false);
    setEditingJob(null);
  };

  const handleDelete = () => {
    if (editingJob && confirm('Sei sicuro di voler eliminare questa scheda lavoro e la relativa consegna?')) {
      deleteJob(editingJob.id);
      setIsJobModalOpen(false);
      setEditingJob(null);
    }
  };

  const handlePrintPDF = () => {
    if (editingJob) {
      generateJobPDF(businessProfile, {
        ...editingJob,
        ...formData,
        balance: currentBalance,
      });
    }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.propertyAddress)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-float border border-slate-200 dark:border-slate-800 my-auto overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingJob ? 'Scheda Lavoro & Produzione' : 'Nuova Scheda Lavoro'}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Gestione stato di avanzamento, riprese, editing e consegna
            </p>
          </div>

          <div className="flex items-center gap-2">
            {editingJob && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoGalleryJob(editingJob);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Galleria Foto & Video</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  title="Stampa Scheda PDF / Ricevuta"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Esporta PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  title="Elimina scheda"
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button 
              onClick={() => {
                setIsJobModalOpen(false);
                setEditingJob(null);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* STATO LAVORAZIONE (I 8 STATI RICHIESTI) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Stato Avanzamento Incarico (8 Fasi)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(JOB_STATUS_LABELS) as JobStatus[]).map((statusKey) => {
                const conf = JOB_STATUS_LABELS[statusKey];
                const isSelected = formData.status === statusKey;
                return (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: statusKey })}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs font-medium flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] opacity-80 mb-0.5">Fase {conf.step}</span>
                    <span className="font-semibold line-clamp-1">{conf.label.replace(/^\d+\.\s*/, '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dati Committente & Immobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cliente / Referente *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Agenzia Immobiliare
              </label>
              <input
                type="text"
                placeholder="Nome agenzia"
                value={formData.agency}
                onChange={e => setFormData({ ...formData, agency: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Telefono</span>
                {formData.phone && (
                  <a href={`tel:${formData.phone}`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[11px]">
                    <PhoneCall className="w-3 h-3" /> Chiama
                  </a>
                )}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Indirizzo Immobile con Maps Link */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Indirizzo Completo Immobile *
              </label>
              {formData.propertyAddress && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3 h-3" /> Naviga con Maps
                </a>
              )}
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.propertyAddress}
                onChange={e => setFormData({ ...formData, propertyAddress: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Assegnazione Team / Operatori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fotografo / Operatore Incaricato
              </label>
              <select
                value={formData.assignedPhotographerId}
                onChange={e => setFormData({ ...formData, assignedPhotographerId: e.target.value })}
                className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- Seleziona fotografo --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Editor Post-Produzione / Video
              </label>
              <select
                value={formData.assignedEditorId}
                onChange={e => setFormData({ ...formData, assignedEditorId: e.target.value })}
                className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- Seleziona editor --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date e Produzione */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                Consegna Prevista *
              </label>
              <input
                type="date"
                required
                value={formData.targetDeliveryDate}
                onChange={e => setFormData({ ...formData, targetDeliveryDate: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Foto Previste
              </label>
              <div className="relative">
                <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0"
                  value={formData.expectedPhotos}
                  onChange={e => setFormData({ ...formData, expectedPhotos: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Video / Reel
              </label>
              <div className="relative">
                <Video className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0"
                  value={formData.expectedVideos}
                  onChange={e => setFormData({ ...formData, expectedVideos: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Link Cartella Cloud (Google Drive / Dropbox) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Link Cartella Cloud (Google Drive / Dropbox / WeTransfer)
              </label>
              {formData.cloudFolderUrl && (
                <a
                  href={formData.cloudFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3 h-3" /> Apri cartella cloud
                </a>
              )}
            </div>
            <div className="relative">
              <FolderDown className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                placeholder="https://drive.google.com/drive/folders/... oppure Dropbox link"
                value={formData.cloudFolderUrl}
                onChange={e => setFormData({ ...formData, cloudFolderUrl: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
          </div>

          {/* Note di Lavorazione */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Note di Lavorazione & Istruzioni di Montaggio/Fotoritocco
            </label>
            <textarea
              rows={2}
              placeholder="Es. Sostituzione cielo nuvoloso, rimuovere auto parcheggiata davanti al cancello, musica allegra per il video..."
              value={formData.workNotes}
              onChange={e => setFormData({ ...formData, workNotes: e.target.value })}
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CONTABILITÀ LAVORO: PREZZO, ACCONTO, SALDO, STATO PAGAMENTO */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Euro className="w-4 h-4 text-emerald-600" />
              Condizioni Economiche & Pagamento
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Prezzo Servizio (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full py-1.5 px-3 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Acconto Ricevuto (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={formData.deposit}
                  onChange={e => setFormData({ ...formData, deposit: Number(e.target.value) })}
                  className="w-full py-1.5 px-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Saldo da Ricevere
                </label>
                <div className={`py-1.5 px-3 text-sm font-bold rounded-xl border ${
                  currentBalance > 0 
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' 
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                }`}>
                  € {currentBalance.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Stato Pagamento
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
                  className="w-full py-1.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="in_attesa_acconto">In attesa acconto</option>
                  <option value="acconto_ricevuto">Acconto ricevuto</option>
                  <option value="in_attesa_saldo">In attesa saldo</option>
                  <option value="saldato">Saldato / Pagato</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Metodo di Pagamento
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="Bonifico">Bonifico Bancario</option>
                  <option value="Carta">Carta di Credito / Bancomat</option>
                  <option value="Contanti">Contanti</option>
                  <option value="PayPal / Stripe">PayPal / Stripe</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Data Effettivo Incasso / Saldo
                </label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsJobModalOpen(false);
                setEditingJob(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-600/30 transition-all"
            >
              {editingJob ? 'Salva Scheda Lavoro' : 'Crea Scheda Lavoro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
