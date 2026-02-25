"use client";

import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 w-full p-4 sm:p-6 z-40">
      <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4">
        <div className="h-10 w-10 sm:h-14 sm:w-14 relative shrink-0">
          <Image
            src="/logo.jpg"
            alt="Mwangaza Wetu Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="hidden sm:block">
          <h2 className="text-xs sm:text-sm font-semibold text-primary dark:text-white tracking-tight">
            MINI-COOPERATIVE D&apos;EPARGNE
          </h2>
          <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300">
            MWANGAZA WETU
          </p>
        </div>
      </div>
    </nav>
  );
}
