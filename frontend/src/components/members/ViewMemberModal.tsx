"use client";

import { useEffect, useState } from "react";
import { X, User, Phone, Mail, MapPin, Calendar, CreditCard, Clock, Activity, Fingerprint, ShieldAlert, Loader2 } from "lucide-react";
import { useMemberById } from "@/hooks/useMembers";
import { ACCOUNT_TYPES } from "@/lib/constants";

interface ViewMemberModalProps {
  memberId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewMemberModal({
  memberId,
  isOpen,
  onClose,
}: ViewMemberModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  const { data: member, isLoading, isError } = useMemberById(memberId, { enabled: isOpen && !!memberId });

  // Animation stuff
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getPhotoUrl = (photo?: string | null) => {
    if (!photo) return null;
    if (photo.startsWith('data:')) return photo;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/api$/, '');
    return `${baseUrl}/uploads/${photo}?t=${Date.now()}`;
  };

  const getInitials = (name?: string): string => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Non renseigné";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const accountTypeLabel = member ? (ACCOUNT_TYPES.find(t => t.value === member.typeCompte)?.label || member.typeCompte) : "";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${isVisible ? "bg-slate-900/60 backdrop-blur-sm opacity-100" : "bg-transparent opacity-0"}`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div 
          className={`w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800 pointer-events-auto transition-all duration-500 transform ${isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-10"}`}
        >
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-slate-500 font-medium">Chargement du profil...</p>
            </div>
          ) : isError || !member ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 bg-red-50 dark:bg-red-900/10">
              <ShieldAlert className="w-12 h-12 text-red-500" />
              <p className="text-red-700 dark:text-red-400 font-bold">Impossible de charger les informations de ce membre.</p>
              <button onClick={onClose} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm">Fermer</button>
            </div>
          ) : (
            <>
              {/* Header Profile Banner */}
              <div className="relative h-32 sm:h-40 bg-gradient-to-r from-primary to-blue-400">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all active:scale-95 z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Decorative Pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              </div>

              {/* Main Content Area */}
              <div className="relative px-6 sm:px-8 pb-8 pt-0 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* Avatar & Main Info Row */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-16 sm:-mt-20 relative z-10 mb-8">
                  {/* Photo Profile overlapping from the banner */}
                  <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-900 shadow-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 group">
                    {member.photoProfil ? (
                      <img 
                        src={getPhotoUrl(member.photoProfil) as string} 
                        alt={member.nomComplet} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <span className="text-4xl font-black text-slate-300 dark:text-slate-600">{getInitials(member.nomComplet)}</span>
                    )}
                  </div>

                  <div className="flex-1 pb-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${member.statut === 'actif' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        {member.statut === 'actif' ? 'Compte Actif' : 'Compte Inactif'}
                      </span>
                      <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-primary/10 border border-primary/20 text-primary">
                        {accountTypeLabel}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
                      {member.nomComplet}
                    </h2>
                    <p className="text-slate-500 font-mono text-sm sm:text-base font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      #{member.numeroCompte}
                    </p>
                  </div>
                </div>

                {/* Grid Info Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Column 1: Coordonnées & Identité */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-shadow">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Identité du Membre
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                          <span className="text-sm text-slate-500">Sexe</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white uppercase">{member.sexe === 'M' ? 'Masculin' : member.sexe === 'F' ? 'Féminin' : 'ND'}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                          <span className="text-sm text-slate-500">Naissance</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(member.dateNaissance)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                          <span className="text-sm text-slate-500">ID Nationale</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{member.idNationale || 'Non renseignée'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-shadow">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Coordonnées de Contact
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-primary/20 flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{member.telephone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{member.email || "Aucun email"}</span>
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{member.adresse || "Adresse non spécifiée"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Compte & Biométrie & Délégué */}
                  <div className="space-y-6">
                    
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-5 border border-primary/20">
                      <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Infos Système
                      </h3>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary opacity-70" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Inscrit le</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(member.dateAdhesion)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Fingerprint className={`w-5 h-5 ${member.userId ? 'text-emerald-500' : 'text-slate-400'}`} />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Biométrie</span>
                        </div>
                        {member.userId ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-xs font-bold uppercase tracking-wider">Configurée (ID: {member.userId})</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 rounded text-xs font-bold uppercase tracking-wider">Non Configurée</span>
                        )}
                      </div>
                    </div>

                    {/* Délégué Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Mandataire / Délégué
                        </span>
                        {member.delegues && member.delegues.length > 0 && <span className="w-2 h-2 rounded-full bg-primary"></span>}
                      </h3>
                      
                      {member.delegues && member.delegues.length > 0 ? (
                        <div className="space-y-4 pt-1">
                          {member.delegues.map((delegue) => (
                            <div key={delegue.id} className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border border-slate-300 dark:border-slate-600">
                                {delegue.photoProfil ? (
                                  <img src={getPhotoUrl(delegue.photoProfil) as string} alt={delegue.nom} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold text-slate-400">{getInitials(delegue.nom)}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{delegue.nom}</h4>
                                <p className="text-xs text-primary font-bold mb-1">{delegue.relation}</p>
                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {delegue.telephone}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                          <p className="text-sm font-medium text-slate-500">Aucun délégué enregistré</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-3xl">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
