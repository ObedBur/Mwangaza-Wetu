"use client";

import { Fingerprint, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

/** États possibles du scanner */
export type ScanStatus = "idle" | "scanning" | "success" | "error";

export interface BiometricScannerProps {
  /** Label affiché dans le header (ex: "Membre Titulaire", "Délégué") */
  label: string;
  /** Statut courant retourné par useZkTeco */
  status: ScanStatus;
  /** Message d'erreur retourné par useZkTeco (null si pas d'erreur) */
  error: string | null;
  /** ID biométrique capturé (null si pas encore scanné ou en erreur) */
  userId: string | null;
  /** Vrai pendant la requête API */
  scanning: boolean;
  /** Callback pour déclencher la capture */
  onScan: () => void;
  /** Variant d'affichage : "card" (avec bordure et fond) ou "minimal" (inline) */
  variant?: "card" | "minimal";
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Composant réutilisable pour l'interface de scan biométrique ZKTeco.
 *
 * Gère visuellement les 4 états du scanner :
 *   - idle     → bouton "Scanner"
 *   - scanning → animation en attente du doigt
 *   - success  → ID capturé avec option "Refaire"
 *   - error    → message d'erreur + bouton "Réessayer"
 *
 * Usage :
 *   const { isScanning, scanStatus, scanError, userId, scanFingerprint } = useZkTeco();
 *   <BiometricScanner
 *     label="Membre Titulaire"
 *     status={scanStatus}
 *     error={scanError}
 *     userId={userId}
 *     scanning={isScanning}
 *     onScan={scanFingerprint}
 *   />
 */
export default function BiometricScanner({
  label,
  status,
  error,
  userId,
  scanning,
  onScan,
  variant = "card",
  className = "",
}: BiometricScannerProps) {
  const isCard = variant === "card";

  return (
    <div
      className={`${
        isCard
          ? "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm"
          : ""
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Fingerprint className="w-3 h-3" />
          Capture : {label}
        </label>
        {status === "success" && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            PRÊT
          </span>
        )}
        {status === "scanning" && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            <Loader2 className="w-3 h-3 animate-spin" />
            EN COURS
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* ── État IDLE : bouton de déclenchement ──────────────────────── */}
        {status === "idle" && (
          <button
            type="button"
            onClick={onScan}
            disabled={scanning}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm disabled:opacity-60"
          >
            <Fingerprint className="w-4 h-4" />
            {scanning ? "Lecture..." : `Scanner ${label}`}
          </button>
        )}

        {/* ── État SCANNING : animation d'attente ───────────────────────── */}
        {status === "scanning" && (
          <div className="bg-primary/5 rounded-lg p-6 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-3">
            <div className="relative">
              {/* Anneau d'animation */}
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
              <div className="relative w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Fingerprint className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black text-primary block uppercase tracking-wider">
                En attente du doigt...
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block">
                Posez le doigt sur le lecteur
              </span>
            </div>
          </div>
        )}

        {/* ── État SUCCESS : ID capturé ─────────────────────────────────── */}
        {status === "success" && userId && (
          <div className="flex items-center justify-between gap-3 bg-green-50/70 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-green-800 dark:text-green-300 uppercase tracking-wide">
                  Empreinte capturée
                </p>
                <p className="text-[11px] font-mono text-green-600 dark:text-green-400 font-bold">
                  ID : {userId}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onScan}
              className="text-[9px] font-black underline uppercase text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 whitespace-nowrap"
            >
              Refaire
            </button>
          </div>
        )}

        {/* ── État ERROR : message + retry ─────────────────────────────── */}
        {status === "error" && (
          <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-red-700 dark:text-red-400 leading-tight">
                {error || "Placez le doigt encore ou réessayez"}
              </p>
            </div>
            <button
              type="button"
              onClick={onScan}
              className="w-full py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] transition-all uppercase active:scale-95"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
