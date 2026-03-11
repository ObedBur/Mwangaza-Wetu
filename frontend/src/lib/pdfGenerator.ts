import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MemberRecord } from '@/types';

/**
 * Génère un fichier PDF professionnel pour un membre nouvellement créé ou consulté.
 */
export const generateMemberReceiptPDF = (member: MemberRecord) => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('fr-FR');
    const timeStr = new Date().toLocaleTimeString('fr-FR');

    // Configuration des couleurs et polices
    const primaryColor = [59, 130, 246];
    const textColor = [30, 41, 59];

    // 1. EN-TÊTE
    doc.setFillColor(248, 250, 252); // slate-50 background
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('MWANGAZA WETU', 20, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("MINI-COOPÉRATIVE D'ÉPARGNE", 20, 28);

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(12);
    doc.text('FICHE D\'ADHÉSION & ACCÈS PORTAIL', 120, 20);
    doc.setFontSize(9);
    doc.text(`Généré le ${dateStr} à ${timeStr}`, 120, 28);

    // 2. CORPS DU DOCUMENT
    doc.setDrawColor(226, 232, 240); // slate-200 line
    doc.line(20, 45, 190, 45);

    // Section: Informations Personnelles
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('INFORMATIONS DU MEMBRE', 20, 60);

    const personalInfo = [
        ['Nom Complet', member.nomComplet || ''],
        ['Numéro de Compte', member.numeroCompte || ''],
        ['Téléphone', member.telephone || ''],
        ['Email', member.email || 'Non renseigné'],
        ['Type de Compte', member.typeCompte || ''],
        ['Sexe', member.sexe === 'M' ? 'Masculin' : (member.sexe === 'F' ? 'Féminin' : 'ND')],
        ['Date d\'adhésion', member.dateAdhesion ? new Date(member.dateAdhesion).toLocaleDateString('fr-FR') : ''],
        ['Adresse', member.adresse || 'Non renseignée'],
    ];

    autoTable(doc, {
        startY: 65,
        head: [['Champ', 'Détails']],
        body: personalInfo,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: primaryColor as any, textColor: 255 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 }, 1: { cellWidth: 'auto' } },
    });

    // Section: Accès au Portail (TRÈS IMPORTANT)
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFillColor(239, 246, 255); // blue-50 background
    doc.roundedRect(20, finalY, 170, 45, 3, 3, 'F');

    doc.setFontSize(14);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('VOS IDENTIFIANTS DE CONNEXION', 25, finalY + 10);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Accédez à votre espace sur : portal.mwangazawetu.com', 25, finalY + 15);

    doc.setFont('helvetica', 'bold');
    doc.text(`IDENTIFIANT : ${member.numeroCompte}`, 25, finalY + 25);
    doc.text(`OU TÉLÉPHONE : ${member.telephone}`, 110, finalY + 25);

    // Extraction du PIN par défaut
    const digits = member.telephone.replace(/\D/g, '');
    const defaultPin = digits.length >= 6 ? digits.slice(-6) : 'N/A';
    doc.text(`CODE PIN INITIAL : ${defaultPin}`, 25, finalY + 35);

    // Note de sécurité
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(239, 68, 68); // red-500
    doc.text('IMPORTANT : Pour votre sécurité, ce code PIN est temporaire.', 25, finalY + 53);
    doc.text('Vous devrez le changer obligatoirement lors de votre première connexion.', 25, finalY + 60);

    // 3. PIED DE PAGE
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(226, 232, 240);
    doc.line(20, pageHeight - 30, 190, pageHeight - 30);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFont('helvetica', 'normal');
    doc.text('Mwangaza Wetu Mini-Coopérative - Goma, Nord-Kivu, RDC', 20, pageHeight - 20);
    doc.text('© 2026 Tous droits réservés.', 160, pageHeight - 20);

    // Sauvegarde du fichier
    doc.save(`Mwangaza_Adhesion_${member.numeroCompte}.pdf`);
};
