import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Client, Appointment, Job, Expense, BusinessProfile } from '../types';

// Helper to trigger file download in browser
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Esporta array in formato CSV con BOM per Excel
export function exportToCSV<T extends Record<string, any>>(data: T[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  
  const csvRows: string[] = [];
  csvRows.push(headers.join(';')); // Usa punto e virgola standard per Excel in Europa
  
  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    });
    csvRows.push(values.join(';'));
  }
  
  const csvContent = '\uFEFF' + csvRows.join('\r\n'); // BOM per corretta codifica caratteri accentati
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

// Generatore PDF del Report Finanziario e Gestionale
export function generatePDFReport(
  profile: BusinessProfile,
  periodLabel: string,
  stats: {
    totalRevenue: number;
    totalCollected: number;
    totalPending: number;
    totalExpenses: number;
    netProfit: number;
    totalShoots: number;
    totalVideos: number;
  },
  recentJobs: Job[],
  recentExpenses: Expense[]
) {
  const doc = new jsPDF();
  
  // Header aziendale
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(profile.studioName || 'Studio Fotografico Immobiliare', 14, 20);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`${profile.photographerName} | P.IVA: ${profile.vatNumber}`, 14, 26);
  doc.text(`${profile.address} | Tel: ${profile.phone} | Email: ${profile.email}`, 14, 31);
  
  // Titolo Report
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 36, 196, 36);
  
  doc.setFontSize(15);
  doc.setTextColor(2, 132, 199); // Sky-600
  doc.text(`Report Finanziario & Attività - ${periodLabel}`, 14, 45);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Data generazione: ${new Date().toLocaleDateString('it-IT')} ore ${new Date().toLocaleTimeString('it-IT')}`, 14, 51);
  
  // Box KPI Finanziari
  autoTable(doc, {
    startY: 56,
    theme: 'grid',
    head: [['METRICA', 'VALORE', 'NOTE']],
    body: [
      ['Fatturato Totale (Lavori)', `€ ${stats.totalRevenue.toFixed(2)}`, 'Valore complessivo dei servizi svolti'],
      ['Incassi Effettivi Ricevuti', `€ ${stats.totalCollected.toFixed(2)}`, 'Acconti e saldi effettivamente incassati'],
      ['Crediti da Incassare (In Sospeso)', `€ ${stats.totalPending.toFixed(2)}`, 'Saldi in attesa di pagamento'],
      ['Spese Totali di Gestione', `€ ${stats.totalExpenses.toFixed(2)}`, 'Carburante, attrezzatura, software, ecc.'],
      ['Guadagno Netto Effettivo', `€ ${stats.netProfit.toFixed(2)}`, 'Incassi effettivi - Spese complessive'],
      ['Totale Immobili Fotografati', `${stats.totalShoots}`, 'Servizi eseguiti nel periodo'],
      ['Totale Video / Reel Realizzati', `${stats.totalVideos}`, 'Produzioni video completate'],
    ],
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Tabella ultimi Lavori
  const currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Dettaglio Lavori del Periodo', 14, currentY);

  autoTable(doc, {
    startY: currentY + 4,
    theme: 'striped',
    head: [['Data', 'Cliente / Agenzia', 'Immobile', 'Servizio', 'Prezzo', 'Stato Pagamento']],
    body: recentJobs.slice(0, 15).map(j => [
      j.shootDate,
      `${j.clientName} (${j.agency || 'Privato'})`,
      j.propertyAddress,
      j.serviceType,
      `€ ${j.price.toFixed(2)}`,
      j.paymentStatus === 'saldato' ? 'Saldato' : `In attesa (€ ${j.balance.toFixed(2)})`
    ]),
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Home Frame | Pagina ${i} di ${pageCount}`, 14, 288);
  }

  doc.save(`Report_HomeFrame_${periodLabel.replace(/\s+/g, '_')}.pdf`);
}

// Generatore PDF Singola Scheda Lavoro / Ricevuta per cliente
export function generateJobPDF(profile: BusinessProfile, job: Job) {
  const doc = new jsPDF();

  // Header Studio
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.studioName || 'Studio Fotografico', 14, 20);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`${profile.photographerName} | P.IVA: ${profile.vatNumber}`, 14, 26);
  doc.text(`${profile.address} | Tel: ${profile.phone} | Email: ${profile.email}`, 14, 31);
  if (profile.iban) {
    doc.text(`IBAN: ${profile.iban} (${profile.bankName || ''})`, 14, 36);
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 42, 196, 42);

  // Titolo Scheda
  doc.setFontSize(16);
  doc.setTextColor(2, 132, 199);
  doc.text(`SCHEDA LAVORO & CONFERMA SERVIZIO`, 14, 52);

  // Info Cliente e Immobile in riquadri
  autoTable(doc, {
    startY: 58,
    theme: 'grid',
    head: [['DATI COMMITTENTE', 'DETTAGLI IMMOBILE & SERVIZIO']],
    body: [
      [
        `Cliente: ${job.clientName}\nAgenzia: ${job.agency || 'N/D'}\nTelefono: ${job.phone}\nEmail: ${job.email}`,
        `Indirizzo: ${job.propertyAddress}\nTipologia: ${job.propertyType}\nData Servizio: ${job.shootDate}\nServizio: ${job.serviceType}`
      ],
      [
        `Materiale Previsto:\n• ${job.expectedPhotos} Fotografie HDR\n• ${job.expectedVideos} Video / Reel\nConsegna prevista: ${job.targetDeliveryDate}`,
        `Note di lavorazione:\n${job.workNotes || 'Standard di ripresa'}\n\nLink Cartella Cloud:\n${job.cloudFolderUrl || 'Verrà fornito ad editing ultimato'}`
      ]
    ],
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
  });

  // Riepilogo Economico
  const currentY = (doc as any).lastAutoTable.finalY + 10;
  autoTable(doc, {
    startY: currentY,
    theme: 'plain',
    head: [['RIASSUNTO ECONOMICO', 'IMPORTO']],
    body: [
      ['Prezzo Concordato del Servizio:', `€ ${job.price.toFixed(2)}`],
      ['Acconto Versato:', `€ ${(job.deposit || 0).toFixed(2)}`],
      ['Saldo Rimanente:', `€ ${job.balance.toFixed(2)}`],
      ['Stato del Pagamento:', job.paymentStatus.toUpperCase()],
      ['Metodo di Pagamento:', job.paymentMethod || 'Bonifico']
    ],
    headStyles: { fontStyle: 'bold', fontSize: 10, textColor: [2, 132, 199] },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  if (profile.notes) {
    const notesY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Note legali / fiscali: ${profile.notes}`, 14, notesY);
  }

  doc.save(`Scheda_Lavoro_${job.clientName.replace(/\s+/g, '_')}_${job.shootDate}.pdf`);
}
