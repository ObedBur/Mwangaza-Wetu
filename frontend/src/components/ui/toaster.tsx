"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Composant Toaster utilisant la bibliothèque 'sonner'
 * Gère l'affichage des notifications (succès, erreur, info)
 */
export function Toaster() {
    return (
        <SonnerToaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            theme="light" // Peut être dynamique selon le thème de l'app
            toastOptions={{
                style: {
                    borderRadius: '12px',
                    padding: '16px',
                },
            }}
        />
    );
}
