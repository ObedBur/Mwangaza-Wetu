'use client'

import { Plus, Printer, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { DepositTransaction } from '@/types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DepositsHeaderProps {
  onCreateClick: () => void;
  transactions?: DepositTransaction[];
}

export default function DepositsHeader({ onCreateClick, transactions = [] }: DepositsHeaderProps) {
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
        'Membre': tx.membre?.nomComplet || 'Inconnu',
        'Compte': tx.compte,
        'Montant': tx.montant,
        'Devise': tx.devise,
        'Date': new Date(tx.dateOperation).toLocaleDateString('fr-FR'),
        'Heure': new Date(tx.dateOperation).toLocaleTimeString('fr-FR'),
        'Description': tx.description || '-',
        'Type': tx.typeOperation,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dépôts');

      const filename = `Depots_${getDateString()}.xlsx`;
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
      const pageHeight = doc.internal.pageSize.getHeight();

      // Ajouter le logo en haut au centre
      try {
        const response = await fetch('/logo.jpg');
        const blob = await response.blob();
        const reader = new FileReader();
        
        await new Promise((resolve) => {
          reader.onload = (e) => {
            const imgData = e.target?.result;
            if (imgData) {
              const logoWidth = 40;
              const logoHeight = 40;
              const logoX = (pageWidth - logoWidth) / 2;
              doc.addImage(imgData, 'JPEG', logoX, 8, logoWidth, logoHeight);
            }
            resolve(null);
          };
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn('Logo non chargé:', err);
      }

      // Titre
      doc.setFontSize(16);
      doc.text('Historique des Dépôts', pageWidth / 2, 55, { align: 'center' });

      // Date
      doc.setFontSize(10);
      doc.text(`Date du rapport: ${getDateString()}`, pageWidth / 2, 65, { align: 'center' });

      // Tableau
      const tableData = transactions.map((tx) => ([
        tx.membre?.nomComplet || 'Inconnu',
        tx.compte,
        tx.montant.toString(),
        tx.devise,
        new Date(tx.dateOperation).toLocaleDateString('fr-FR'),
        tx.description || '-',
      ]));

      autoTable(doc, {
        head: [['Membre', 'Compte', 'Montant', 'Devise', 'Date', 'Description']],
        body: tableData,
        startY: 75,
        styles: {
          cellPadding: 3,
          fontSize: 9,
          cellWidth: 'wrap',
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
      });

      const filename = `Depots_${getDateString()}.pdf`;
      doc.save(filename);
      setIsExporting(false);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de l\'export PDF');
      setIsExporting(false);
    }
  };
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary font-bold">$</div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Dépôts</h1>
            <p className="text-xs sm:text-sm text-slate-500">Historique et saisie des dépôts d&apos;épargne</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>

          <button
            type="button"
            onClick={exportToPDF}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            PDF
          </button>

          <button
            type="button"
            onClick={exportToExcel}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Excel
          </button>
        </div>
      </div>
    </div>
  );
}
