"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, setAuthCookies, removeAuthCookies, COOKIE_NAME, USER_COOKIE_NAME } from '@/lib/cookies';

/**
 * Interface représentant l'utilisateur connecté
 */
interface User {
    id: string;
    email: string;
    role: string;
    numero_compte?: string;
    nom_complet?: string;
    photo_profil?: string;
    firstAcces?: boolean;
}

/**
 * État du contexte d'authentification
 */
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User, skipRedirect?: boolean) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fournisseur de contexte d'authentification
 * Migré du localStorage vers les Cookies pour compatibilité Middleware
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Vérifier si un token existe dans les cookies au chargement
        const token = getCookie(COOKIE_NAME);

        if (token) {
            try {
                const savedUserStr = getCookie(USER_COOKIE_NAME);
                if (savedUserStr) {
                    setUser(JSON.parse(decodeURIComponent(savedUserStr)));
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de l'utilisateur depuis les cookies", error);
                logout();
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User, skipRedirect?: boolean) => {
        // Sauvegarde dans les cookies (accessible au serveur/middleware)
        setAuthCookies(token, userData);
        setUser(userData);

        // Permettre de ne pas rediriger (ex: firstAcces pour changer le PIN)
        if (skipRedirect) return;

        // Redirection basée sur le rôle de l'utilisateur
        const role = userData.role?.toUpperCase() || '';
        console.log(`[AuthProvider] User logged in with role: ${role}`);

        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            router.push('/dashboard');
        } else {
            // Membre → portail membre
            const target = `/portal/${userData.numero_compte || ''}`;
            console.log(`[AuthProvider] Redirecting to portal: ${target}`);
            router.push(target);
        }
        router.refresh();
    };

    const logout = () => {
        // Nettoyage des cookies
        removeAuthCookies();
        setUser(null);

        router.push('/');
        router.refresh();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
}
