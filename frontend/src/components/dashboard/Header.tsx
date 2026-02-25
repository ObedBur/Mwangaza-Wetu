"use client";

import React, { useState } from "react";
import {
  Search,
  Settings,
  UserPlus,
  Users,
  Wrench,
  History,
  Info,
  HelpCircle,
} from "lucide-react";
import Image from "next/image";

export default function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="bg-primary p-1.5 sm:p-2 rounded-lg text-white shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 6 15.5 6 14 6.67 14 7.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 6 8.5 6 7 6.67 7 7.5 7.67 9 8.5 9zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Admin
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Mwangaza Wetu
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md relative group">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 border border-transparent focus-within:border-primary transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-sm placeholder:text-slate-400 dark:text-slate-100"
              placeholder="Rechercher un membre ou une transaction..."
              type="text"
            />
          </div>
          {/* Dropdown Suggestions */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl hidden group-focus-within:block overflow-hidden z-50">
            <div className="px-4 py-3 text-xs text-slate-400">
              Aucun résultat pour le moment
            </div>
          </div>
        </div>

        {/* Profile and Settings */}
        <div className="flex items-center gap-4">
          {/* User Profile */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                Administrateur
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">
                Niveau Accès 1
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-primary/20 overflow-hidden relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuApoZn5sQAPSRUE6zPInfR4iqS79JGKzojMX50f0NycBi9WY2xXNSGXynNkJn5taP2yxqNWsp-hivTJl2NdA3Ua5ezBMrW5MEdb_uPvQ4DAfj3vBBaGrEpsiX1wQrb1XrDHQalfVvHO7UQ8QSz524C7482SH570j5PV973LbZVW5MvNRwIue8IiYeM-eddQk_rNsxLJ1bLEVz6HDNkSz6wxwQwBegpSmCFALhBTmy8bOBfHBpOpBms1EGoNVSn5zNbHaOtqrcHqfaA"
                alt="Admin Profile"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Settings Menu */}
          <div className="relative group">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Settings Dropdown */}
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                <a
                  className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary transition-colors"
                  href="#"
                >
                  <UserPlus className="w-5 h-5 mr-3" /> Ajouter un
                  administrateur
                </a>
                <a
                  className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary transition-colors"
                  href="#"
                >
                  <Users className="w-5 h-5 mr-3" /> Gérer les administrateurs
                </a>
                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                <a
                  className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary transition-colors"
                  href="#"
                >
                  <Wrench className="w-5 h-5 mr-3" /> Paramètres généraux
                </a>
                <a
                  className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary transition-colors"
                  href="#"
                >
                  <History className="w-5 h-5 mr-3" /> Historique des actions
                </a>
                <a
                  className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary transition-colors"
                  href="#"
                >
                  <Info className="w-5 h-5 mr-3" /> Infos sur la coopérative
                </a>
                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                <a
                  className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary transition-colors"
                  href="#"
                >
                  <HelpCircle className="w-5 h-5 mr-3" /> Aide & Support
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
