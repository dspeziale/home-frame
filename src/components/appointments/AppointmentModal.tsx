import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, PropertyType, ServiceType, AppointmentStatus } from '../../types';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Euro, 
  FileText, 
  Sparkles,
  PhoneCall,
  ExternalLink,
  Copy,
  Trash2
} from 'lucide-react';

export const AppointmentModal: React.FC = () => {
  const { 
    isAppointmentModalOpen, 
    setIsAppointmentModalOpen, 
    editingAppointment, 
    setEditingAppointment,
    addAppointment, 
    updateAppointment, 
    deleteAppointment,
    duplicateAppointment,
    clients,
    servicesConfig,
    users
  } = useApp();

  const [formData, setFormData] = useState({
    clientName: '',
    agency: '',
    phone: '',
    email: '',
    propertyAddress: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    propertyType: 'Appartamento' as PropertyType,
    squareMeters: 90,
    rooms: 3,
    serviceType: 'Servizio fotografico' as ServiceType,
    agreedPrice: 220,
    deposit: 0,
    notes: '',
    specialRequests: '',
    status: 'confermato' as AppointmentStatus,
    assignedUserId: '',
  });

  useEffect(() => {
    if (editingAppointment) {
      setFormData({
        clientName: editingAppointment.clientName,
        agency: editingAppointment.agency || '',
        phone: editingAppointment.phone,
        email: editingAppointment.email,
        propertyAddress: editingAppointment.propertyAddress,
        date: editingAppointment.date,
        time: editingAppointment.time,
        propertyType: editingAppointment.propertyType,
        squareMeters: editingAppointment.squareMeters,
        rooms: editingAppointment.rooms,
        serviceType: editingAppointment.serviceType,
        agreedPrice: editingAppointment.agreedPrice,
        deposit: editingAppointment.deposit || 0,
        notes: editingAppointment.notes || '',
        specialRequests: editingAppointment.specialRequests || '',
        status: editingAppointment.status,
        assignedUserId: editingAppointment.assignedUserId || '',
      });
    } else {
      // Default new appointment
      const defaultConf = servicesConfig[0];
      setFormData({
        clientName: '',
        agency: '',
        phone: '',
        email: '',
        propertyAddress: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        propertyType: 'Appartamento',
        squareMeters: 90,
        rooms: 3,
        serviceType: defaultConf ? defaultConf.name : 'Servizio fotografico',
        agreedPrice: defaultConf ? defaultConf.defaultPrice : 220,
        deposit: 0,
        notes: '',
        specialRequests: '',
        status: 'confermato',
        assignedUserId: users[0]?.id || '',
      });
    }
  }, [editingAppointment, servicesConfig, users]);

  if (!isAppointmentModalOpen) return null;

  // On client selection from dropdown
  const handleClientSelect = (clientId: string) => {
    const found = clients.find(c => c.id === clientId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        clientName: found.fullName,
        agency: found.agency || prev.agency,
        phone: found.phone || prev.phone,
        email: found.email || prev.email,
      }));
    }
  };

  // On service selection: update default price if price wasn't manually altered
  const handleServiceChange = (serviceName: ServiceType) => {
    const conf = servicesConfig.find(s => s.name === serviceName);
    setFormData(prev => ({
      ...prev,
      serviceType: serviceName,
      agreedPrice: conf ? conf.defaultPrice : prev.agreedPrice
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.propertyAddress.trim() || !formData.phone.trim()) {
      alert('Inserisci almeno il nome del cliente, il numero di telefono e l\'indirizzo dell\'immobile.');
      return;
    }

    if (editingAppointment) {
      updateAppointment(editingAppointment.id, formData);
    } else {
      addAppointment(formData);
    }

    setIsAppointmentModalOpen(false);
    setEditingAppointment(null);
  };

  const handleDelete = () => {
    if (editingAppointment && confirm('Sei sicuro di voler cancellare questo appuntamento?')) {
      deleteAppointment(editingAppointment.id);
      setIsAppointmentModalOpen(false);
      setEditingAppointment(null);
    }
  };

  const handleDuplicate = () => {
    if (editingAppointment) {
      duplicateAppointment(editingAppointment.id);
      setIsAppointmentModalOpen(false);
      setEditingAppointment(null);
    }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.propertyAddress)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-float border border-slate-200 dark:border-slate-800 my-auto overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {editingAppointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
            </h2>
            <p className="text-xs text-slate-500">
              {editingAppointment ? 'Aggiorna i dettagli dell\'appuntamento e della scheda lavoro' : 'Inserisci i dati per l\'incarico fotografico'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {editingAppointment && (
              <>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  title="Duplica tra 7 giorni"
                  className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  title="Elimina appuntamento"
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button 
              onClick={() => {
                setIsAppointmentModalOpen(false);
                setEditingAppointment(null);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Quick client select from existing */}
          {clients.length > 0 && !editingAppointment && (
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <label className="block text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                Seleziona da clienti esistenti (opzionale):
              </label>
              <select
                onChange={e => handleClientSelect(e.target.value)}
                className="w-full text-xs py-1.5 px-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue=""
              >
                <option value="">-- Seleziona un cliente rapido --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} {c.agency ? `(${c.agency})` : ''} - {c.phone}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dati Cliente & Agenzia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Cliente / Referente *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Es. Mario Rossi"
                  value={formData.clientName}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Agenzia Immobiliare
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Es. Gabetti / Engel & Völkers"
                  value={formData.agency}
                  onChange={e => setFormData({ ...formData, agency: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Numero di Telefono *</span>
                {formData.phone && (
                  <a 
                    href={`tel:${formData.phone}`} 
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-normal text-[11px]"
                  >
                    <PhoneCall className="w-3 h-3" /> Chiama ora
                  </a>
                )}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="Es. +39 347 1234567"
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
                  placeholder="Es. agenzia@email.it"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Indirizzo Immobile con pulsante Google Maps */}
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
                  <ExternalLink className="w-3 h-3" /> Apri su Google Maps
                </a>
              )}
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Es. Via Roma 15, Milano piano 3 int. 8"
                value={formData.propertyAddress}
                onChange={e => setFormData({ ...formData, propertyAddress: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Data, Ora, Stato & Operatore Assegnato */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data Servizio *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Orario *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operatore Assegnato
              </label>
              <select
                value={formData.assignedUserId}
                onChange={e => setFormData({ ...formData, assignedUserId: e.target.value })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Seleziona --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Stato Appuntamento
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="confermato">Confermato</option>
                <option value="in_attesa">In Attesa</option>
                <option value="annullato">Annullato</option>
                <option value="completato">Completato</option>
              </select>
            </div>
          </div>

          {/* Dettagli Immobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipologia Immobile
              </label>
              <select
                value={formData.propertyType}
                onChange={e => setFormData({ ...formData, propertyType: e.target.value as PropertyType })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Appartamento">Appartamento</option>
                <option value="Villa / Casale">Villa / Casale</option>
                <option value="Attico">Attico</option>
                <option value="Rustico">Rustico</option>
                <option value="Negozio / Commerciale">Negozio / Commerciale</option>
                <option value="Ufficio">Ufficio</option>
                <option value="Altro">Altro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Metratura (m²)
              </label>
              <input
                type="number"
                min="10"
                value={formData.squareMeters}
                onChange={e => setFormData({ ...formData, squareMeters: Number(e.target.value) })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Numero di Stanze
              </label>
              <input
                type="number"
                min="1"
                value={formData.rooms}
                onChange={e => setFormData({ ...formData, rooms: Number(e.target.value) })}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Servizio & Prezzo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipologia Servizio *
              </label>
              <select
                value={formData.serviceType}
                onChange={e => handleServiceChange(e.target.value as ServiceType)}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="Servizio fotografico">Servizio fotografico</option>
                <option value="Fotografia + video">Fotografia + video</option>
                <option value="Video immobiliare">Video immobiliare</option>
                <option value="Foto + video + drone">Foto + video + drone</option>
                <option value="Virtual tour">Virtual tour</option>
                <option value="Servizio personalizzato">Servizio personalizzato</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Prezzo Concordato (€) *
              </label>
              <div className="relative">
                <Euro className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0"
                  step="5"
                  required
                  value={formData.agreedPrice}
                  onChange={e => setFormData({ ...formData, agreedPrice: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Eventuale Acconto (€)
              </label>
              <div className="relative">
                <Euro className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={formData.deposit}
                  onChange={e => setFormData({ ...formData, deposit: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Richieste Particolari & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Richieste Particolari del Cliente
              </label>
              <textarea
                rows={2}
                placeholder="Es. Video reel 9:16 per Instagram, foto terrazza al tramonto, attenzione alla vista mare..."
                value={formData.specialRequests}
                onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Note & Info Accesso
              </label>
              <textarea
                rows={2}
                placeholder="Es. Chiavi dal portiere, citofono 24, parcheggio interno disponibile..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAppointmentModalOpen(false);
                setEditingAppointment(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-600/30 transition-all"
            >
              {editingAppointment ? 'Salva Modifiche' : 'Crea Appuntamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
