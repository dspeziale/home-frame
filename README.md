# Home Frame - Gestionale Professionale per Fotografia e Video Immobiliare

**Home Frame** è una Web Application gestionale e Progressive Web App (PWA) completa, moderna, rapida e intuitiva, progettata specificamente per i professionisti della **fotografia e produzione video per il settore immobiliare** (appartamenti di pregio, ville, case vacanza, cantieri e agenzie immobiliari).

L'applicazione è sviluppata con un'architettura **Mobile-First Responsive**, che consente un utilizzo fluido sia da smartphone (in mobilità, tra un servizio e l'altro) sia da computer desktop (per editing, fatturazione e reportistica).

---

## 🚀 Caratteristiche Principali

### 1. 👥 Autenticazione e Gestione Utenti
- **Login Protetto con Email e Password**: Accesso sicuro, memorizzazione sessione, toggle mostra/nascondi password, opzione "Ricordami".
- **Gestione Team e Ruoli**:
  - 👑 *Titolare / Amministratore* (`admin`)
  - 📷 *Fotografo / Operatore* (`photographer`)
  - 🎬 *Editor / Post-produzione* (`editor`)
  - 🚁 *Collaboratore / Pilota Drone* (`collaborator`)
- **Assegnazione Operatori**: Assegnazione diretta del fotografo sul campo e dell'editor per ogni singolo appuntamento e scheda lavoro.

### 2. 🎬 Galleria Multimediale Foto & Video
- **Archiviazione ad Alte Prestazioni con IndexedDB**: Carica centinaia di megabyte di fotografie ad alta risoluzione (JPG, PNG, WebP) senza limiti di quota.
- **Supporto File Video Reali (MP4, MOV, WebM)**: Caricamento video diretto e riproduzione fluida nel player integrato.
- **Link Video Cloud**: Possibilità di collegare e riprodurre all'istante video tour ospitati su Google Drive, YouTube, Vimeo, Dropbox o WeTransfer.
- **Tag Categorie Ambienti**: *Copertina, Soggiorno, Cucina, Camera, Bagno, Esterni, Terrazzo / Vista, Drone, Video & Reel, Dettagli*.
- **Foto di Copertina**: Impostazione con un click dello scatto principale visibile nelle schede Kanban.
- **Lightbox a Schermo Intero**: Visualizzatore con controlli di riproduzione video e scorrimento foto.

### 3. 📊 Dashboard Panoramica
- **Metriche in tempo reale:** Appuntamenti di oggi, prossimi incarichi, servizi completati, lavori in fase di editing, materiale da consegnare e consegne effettuate.
- **Riepilogo finanziario mensile:** Fatturato totale, incassi effettivi in cassa, spese sostenute, guadagno netto e totale pagamenti da ricevere.
- **Grafici interattivi:** Andamento storico (ultimi 6 mesi) di incassi, spese e profitto netto; distribuzione dei servizi svolti.
- **Azioni rapide:** Chiamata diretta del cliente (`tel:`) o apertura immediata dell'indirizzo su Google Maps.

### 4. 📅 Gestione Appuntamenti & Calendario Interattivo
- Inserimento rapido: cliente, agenzia, telefono, email, indirizzo immobile, data, orario, tipologia immobile, metratura ($m^2$), stanze, servizio, prezzo concordato, note.
- **3 modalità di calendario:** Mensile, Settimanale e Giornaliera.
- **Conversione automatica:** ogni appuntamento genera automaticamente una **Scheda Lavoro** e una scheda di **Consegna Materiale**.

### 5. 💼 Schede Lavoro (Pipeline di Produzione in 8 Fasi)
1. *Appuntamento confermato*
2. *Da effettuare*
3. *Servizio fotografico effettuato*
4. *Materiale da selezionare*
5. *In fase di editing*
6. *Pronto per la consegna*
7. *Consegnato*
8. *Completato e pagato*
- Doppia visualizzazione Kanban o Tabella dettagliata.
- Esportazione istantanea della Scheda Lavoro in formato PDF.

### 6. 📦 Gestione Consegne Materiale
- Monitoraggio scadenze con avvisi visivi per consegne **in scadenza oggi** o **in ritardo**.
- Stati di lavorazione: *Da preparare, In lavorazione, Pronto, Consegnato, In attesa di modifiche, Modifiche richieste, Nuova consegna effettuata*.

### 7. 💰 Gestione Spese, Incassi e Flussi di Cassa
- Registrazione spese per categoria (*Carburante, Autostrada/parcheggi, Attrezzatura, Manutenzione, Software, Collaboratori, Pubblicità, Altro*).
- Gestione acconti, saldi residui e distinzione tra fatturato teorico e incassi effettivi.

### 8. 🏢 Archivio Clienti & Agenzie Immobiliari
- Schede anagrafiche con storico appuntamenti, fatturato generato e saldo crediti aperti.

### 9. 📈 Statistiche & Report con Esportazione Excel, CSV e PDF
- Filtri temporali: Giornaliero, Settimanale, Mensile, Annuale o Personalizzato.
- Esportazione in un click di tabelle CSV, Excel e Report PDF firmati.

### 10. ⚙️ Impostazioni, Tariffe Personalizzate & Sincronizzazione Supabase
- Listino prezzi configurabile per ogni tipologia di servizio.
- Integrazione opzionale con **Supabase PostgreSQL** per sincronizzazione cloud in tempo reale tra dispositivi.
- Backup e ripristino istantaneo in formato JSON.

---

## 💻 Stack Tecnologico

- **Frontend:** React 19, TypeScript, Vite
- **Styling & UI:** Tailwind CSS, Lucide Icons, Plus Jakarta Sans, JetBrains Mono
- **Visualizzazioni & Grafici:** Recharts, Canvas Confetti
- **Documenti & PDF:** jsPDF, jsPDF-AutoTable
- **Archiviazione Locale:** IndexedDB (`immophoto_db`) + LocalStorage
- **Cloud Backend Opzionale:** Supabase Client (PostgreSQL)
- **Deployment & Server:** Nginx Alpine (Multi-stage Dockerfile)
- **PWA:** Vite PWA Plugin, Service Worker (offline-ready)

---

## 🛠️ Avvio Locale

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo locale
npm run dev

# Compila la build di produzione
npm run build
```

---

## 🐳 Distribuzione su Coolify

Home Frame è già predisposta per essere distribuita su **Coolify** con zero configurazioni manuali tramite il `Dockerfile` e il file `nginx.conf` inclusi nel repository:

### Procedura Passo-Passo su Coolify:

1. **Accedi alla tua istanza Coolify**:
   - Vai nella sezione **Projects** -> seleziona o crea un progetto.
2. **Aggiungi una nuova risorsa**:
   - Clicca su **+ New** -> Seleziona **Application**.
3. **Collega il Repository GitHub**:
   - Seleziona **Public Repository** (o GitHub App se privato).
   - Inserisci l'URL del tuo repository GitHub:  
     `https://github.com/dspeziale/home-frame` (o il nome del tuo repo)
   - Branch: `main`
4. **Configurazione Build Pack**:
   - Coolify rileverà automaticamente il **Dockerfile** multi-stage presente nella root del progetto.
   - Porta esposta del container: **`80`** (già configurata in `nginx.conf`).
5. **Configura il Dominio**:
   - Nel campo **FQDN / Domains**, inserisci il tuo dominio o sottodominio con HTTPS (es. `https://homeframe.tuodominio.it`). Coolify configurerà automaticamente i certificati SSL Let's Encrypt.
6. **Avvia il Deploy**:
   - Clicca su **Deploy**.
   - In circa 60 secondi il container verrà compilato, avviato e protetto da proxy Nginx con HTTPS attivo e PWA installabile!

---

## 🔑 Credenziali Demo Predefinite

Per test immediati sono già disponibili account preconfigurati con password:
`password123`

- **Titolare / Admin:** `marco.bellini.photo@gmail.com`
- **Fotografo Senior:** `alessandro.conti@immophoto.it`
- **Specialista Video & Drone:** `elena.moretti@immophoto.it`
- **Editor Post-produzione:** `luca.ferrari@immophoto.it`
