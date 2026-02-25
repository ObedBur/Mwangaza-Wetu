import { apiClient } from '@/lib/apiClient';
import { LoginInput } from '@/lib/validations';

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    nom_complet?: string;
  };
}

export const authService = {
  login: async (data: LoginInput) => {
    // Déterminer si c'est un admin ou un membre (ou essayer les deux)
    // Par défaut, on essaie comme membre s'il n'y a pas d'indication contraire
    // Mais ici on va d'abord préparer l'objet DTO pour le backend
    const isEmail = data.identifier.includes('@');
    const loginDto = {
      [isEmail ? 'email' : 'numeroCompte']: data.identifier,
      password: data.password,
    };

    try {
      // On essaie d'abord la connexion admin (plus restrictive)
      console.log('Tentative connexion admin...');
      const response = await apiClient.post<LoginResponse>('auth/admin/login', loginDto);
      return response.data;
    } catch (adminError: any) {
      // Si l'admin n'est pas trouvé, on essaie comme membre
      // Note: On utilise adminError.status car l'apiClient normalise l'erreur
      if (adminError.status === 401 || adminError.status === 404) {
        console.log('Admin non trouvé, tentative connexion membre...');
        const response = await apiClient.post<LoginResponse>('auth/membre/login', loginDto);
        return response.data;
      }
      // Si c'est une autre erreur (ex: mauvais mot de passe pour un compte trouvé), on la propage
      throw adminError;
    }
  },
};