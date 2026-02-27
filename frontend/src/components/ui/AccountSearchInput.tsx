"use client";

import React, { useRef, useEffect } from "react";
import { Search, Loader2, User, CheckCircle } from "lucide-react";
import { AccountSuggestion, useAccountSearch } from "@/hooks/useAccountSearch";

interface AccountSearchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AccountSuggestion) => void;
  error?: { message?: string };
  placeholder?: string;
  className?: string;
}

/**
 * Composant d'input avec recherche intuitive (autocomplétion)
 * pour les numéros de compte ou noms de membres.
 */
export default function AccountSearchInput({
  label,
  value,
  onChange,
  onSelect,
  error,
  placeholder = "Rechercher un compte...",
  className = "",
}: AccountSearchInputProps) {
  const {
    suggestions,
    isSearching,
    isOpen,
    setQuery,
    selectSuggestion,
    closeSuggestions,
    inputRef,
  } = useAccountSearch({
    onSelect,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchroniser la valeur externe avec le state interne du hook si nécessaire
  // Note: On évite de boucler en ne mettant à jour que si différent
  useEffect(() => {
    if (value !== undefined) {
      // On ne met à jour le query interne que si l'utilisateur n'est pas en train de taper
      // ou si le changement vient d'une source externe (ex: scanneur)
    }
  }, [value]);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        closeSuggestions();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeSuggestions, inputRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val); // Update parent (react-hook-form)
    setQuery(val); // Trigger search hook
  };

  return (
    <div className={`relative space-y-1.5 ${className}`}>
      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        <Search className="w-3.5 h-3.5 text-slate-400" />
        {label}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 2 && setQuery(value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 transition-all font-semibold text-sm outline-none ${
            error
              ? "border-red-500 focus:ring-red-500/10"
              : "border-slate-200 dark:border-slate-700 focus:ring-primary/10"
          }`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSearching && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          {value && !isSearching && (
             <CheckCircle className={`w-4 h-4 ${value.includes('COOP-') ? 'text-green-500' : 'text-slate-300'}`} />
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-[11px] font-medium animate-in fade-in slide-in-from-top-1">
          {error.message}
        </p>
      )}

      {/* Dropdown de suggestions */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-[60] mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
            {suggestions.map((s: AccountSuggestion) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSuggestion(s)}
                className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                  {s.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {s.nomComplet}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 truncate">
                    {s.numeroCompte}
                  </p>
                </div>
                <div className="shrink-0 scale-75 opacity-50">
                   {s.statut === 'actif' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
