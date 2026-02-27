'use client'

import { Plus, Printer, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { MemberRecord } from '@/types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ACCOUNT_TYPES } from '@/lib/constants';

interface MembersHeaderProps {
  onCreateClick: () => void;
  members?: MemberRecord[];
}

export default function MembersHeader({ onCreateClick, members = [] }: MembersHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const getDateString = () => {
    const today = new Date();
    return today.toLocaleDateString('fr-FR');
  };

  const getAccountTypeLabel = (typeCompte: string) => {
    const type = ACCOUNT_TYPES.find(t => t.value === typeCompte);
    return type?.label || typeCompte;
  };

  const exportToExcel = () => {
    if (!members.length) {
      alert('Aucune donnée à exporter');
      return;
    }

    setIsExporting(true);
    try {
      const data = members.map((member) => ({
        'N° Compte': member.numeroCompte,
        'Nom Complet': member.nomComplet,
        'Téléphone': member.telephone,
        'Type Compte': getAccountTypeLabel(member.typeCompte),
        'Sexe': member.sexe === 'M' ? 'Masculin' : 'Féminin',
        'Date Adhésion': new Date(member.dateAdhesion).toLocaleDateString('fr-FR'),
        'Statut': member.statut === 'actif' ? 'Actif' : 'Inactif',
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Membres');

      const filename = `Membres_${getDateString()}.xlsx`;
      XLSX.writeFile(wb, filename);
      setIsExporting(false);
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      alert('Erreur lors de l\'export Excel');
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    if (!members.length) {
      alert('Aucune donnée à exporter');
      return;
    }

    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Ajouter le logo en haut au centre
      try {
        const response = await fetch('/logo.jpg');
        const blob = await response.blob();
        const reader = new FileReader();
        
        await new Promise((resolve) => {
          reader.onload = (e) => {
            const imgData = e.target?.result;
            if (imgData && typeof imgData === 'string') {
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
      doc.text('Liste des Membres', pageWidth / 2, 55, { align: 'center' });

      // Date
      doc.setFontSize(10);
      doc.text(`Date du rapport: ${getDateString()}`, pageWidth / 2, 65, { align: 'center' });

      // Tableau
      const tableData = members.map((member) => [
        member.numeroCompte,
        member.nomComplet,
        member.telephone,
        getAccountTypeLabel(member.typeCompte),
        member.sexe === 'M' ? 'M' : 'F',
        new Date(member.dateAdhesion).toLocaleDateString('fr-FR'),
        member.statut === 'actif' ? 'Actif' : 'Inactif',
      ]);

      autoTable(doc, {
        head: [['N° Compte', 'Nom', 'Téléphone', 'Type', 'Sexe', 'Adhésion', 'Statut']],
        body: tableData,
        startY: 75,
        styles: {
          cellPadding: 2,
          fontSize: 8,
          cellWidth: 'wrap',
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
      });

      const filename = `Membres_${getDateString()}.pdf`;
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
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Gestion des Membres</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Gérer l'adhésion et l'activité des membres.</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Créer
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
