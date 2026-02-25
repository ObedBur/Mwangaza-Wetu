import { toast } from "sonner";

/**
 * Hook personnalisé pour afficher des notifications (Toasts)
 * Utilise 'sonner' sous le capot pour une expérience fluide.
 */
export const useToast = () => {
    /**
     * Affiche une notification de succès
     */
    const success = (message: string, description?: string) => {
        toast.success(message, {
            description: description,
        });
    };

    /**
     * Affiche une notification d'erreur
     */
    const error = (message: string, description?: string) => {
        toast.error(message, {
            description: description,
        });
    };

    /**
     * Affiche une notification d'information
     */
    const info = (message: string, description?: string) => {
        toast.info(message, {
            description: description,
        });
    };

    /**
     * Affiche une notification d'avertissement
     */
    const warning = (message: string, description?: string) => {
        toast.warning(message, {
            description: description,
        });
    };

    /**
     * Affiche une notification de chargement (promesse)
     */
    const promise = (promise: Promise<any>, { loading, success, error }: { loading: string, success: string, error: string }) => {
        return toast.promise(promise, {
            loading,
            success,
            error,
        });
    };

    return {
        toast, // Permet d'utiliser directement l'objet sonner si besoin
        success,
        error,
        info,
        warning,
        promise,
    };
};
