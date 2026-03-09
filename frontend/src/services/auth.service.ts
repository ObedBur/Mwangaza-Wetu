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
    numero_compte?: string;
    nom_complet?: string;
    photo_profil?: string;
    firstAcces?: boolean;
  };
}

export const authService = {
  login: async (data: LoginInput) => {
    let loginDto: any = { password: data.password };
    const ident = data.identifier.trim();

    if (ident.includes('@')) {
      loginDto.email = ident;
    } else if (ident.toUpperCase().startsWith('MW-')) {
      loginDto.numeroCompte = ident;
    } else {
      // Par défaut, on tente par téléphone si c'est surtout des chiffres
      loginDto.telephone = ident;
    }

    // Détecter si c'est un identifiant membre (format MW-XXX-XXXXXX)
    const isMemberIdentifier = /^MW-[A-Z]{1,4}-/i.test(ident);

    try {
      // If it looks like a member account number, try member login directly
      if (isMemberIdentifier) {
        const response = await apiClient.post<LoginResponse>('auth/membre/login', loginDto);
        return response.data;
      }

      // Otherwise, try admin first, then member
      try {
        const response = await apiClient.post<LoginResponse>('auth/admin/login', loginDto);
        return response.data;
      } catch (adminError: any) {
        if (adminError.status === 401 || adminError.status === 404) {
          const response = await apiClient.post<LoginResponse>('auth/membre/login', loginDto);
          return response.data;
        }
        throw adminError;
      }
    } catch (error: any) {
      throw error;
    }
  },

  changePassword: async (numeroCompte: string, newPassword: string) => {
    const response = await apiClient.post('auth/membre/change-password', {
      numeroCompte,
      newPassword,
    });
    return response.data;
  },
};