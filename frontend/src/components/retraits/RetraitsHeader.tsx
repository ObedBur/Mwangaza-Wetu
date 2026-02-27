'use client'

import { Plus, Printer, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { WithdrawalTransaction } from '@/types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RetraitsHeaderProps {
  onCreateClick: () => void;
  transactions?: WithdrawalTransaction[];
}

export default function RetraitsHeader({ onCreateClick, transactions = [] }: RetraitsHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const getDateString = () => {
    const today = new Date();
    return today.toLocaleDateString('fr-FR');
  };

  const exportToExcel = () => {
    if (!transactions.length) {
      alert('Aucune donnée à exporter');
      return;
    }

    setIsExporting(true);
    try {
      const data = transactions.map((tx) => ({
        'N° Compte': tx.accountNumber,
        'Membre': tx.memberName,
        'Montant': tx.amount,
        'Devise': tx.currency,
        'Date': tx.dateISO,
        'Heure': tx.time,
        'Raison': tx.reason || '-',
        'Statut': tx.status,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Retraits');

      const filename = `Retraits_${getDateString()}.xlsx`;
      XLSX.writeFile(wb, filename);
      setIsExporting(false);
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      alert('Erreur lors de l\'export Excel');
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    if (!transactions.length) {
      alert('Aucune donnée à exporter');
      return;
    }

    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Titre
      doc.setFontSize(16);
      doc.text('Historique des Retraits', pageWidth / 2, 20, { align: 'center' });

      // Date
      doc.setFontSize(10);
      doc.text(`Généré le: ${getDateString()}`, pageWidth / 2, 28, { align: 'center' });

      // Tableau
      const tableData = transactions.map((tx) => [
        tx.accountNumber,
        tx.memberName,
        tx.amount.toString(),
        tx.currency,
        tx.dateISO,
        tx.reason || '-',
      ]);

      autoTable(doc, {
        head: [['Compte', 'Membre', 'Montant', 'Devise', 'Date', 'Raison']],
        body: tableData,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      const filename = `Retraits_${getDateString()}.pdf`;
      doc.save(filename);
      setIsExporting(false);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de l\'export PDF');
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>Gestion Financière</span>
          <span className="text-slate-400">/</span>
          <span className="text-primary font-medium">Retraits</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Gestion des Retraits
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Surveillez et validez les sorties de fonds en temps réel.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={exportToPDF}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          PDF
        </button>
        <button
          type="button"
          onClick={exportToExcel}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Excel
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <Printer className="w-4 h-4" />
          Imprimer
        </button>
        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau Retrait
        </button>
      </div>
    </div>
  );
}
