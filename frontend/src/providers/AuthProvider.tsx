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
}

/**
 * État du contexte d'authentification
 */
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
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

    const login = (token: string, userData: User) => {
        // Sauvegarde dans les cookies (accessible au serveur/middleware)
        setAuthCookies(token, userData);
        setUser(userData);

        // On force un rafraîchissement ou une navigation pour que le middleware voie le nouveau cookie
        router.push('/dashboard');
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
