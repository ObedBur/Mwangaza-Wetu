import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { API_ROUTES } from '@/config/api';

/**
 * Réponse de l'API biométrique
 */
interface BiometricVerifyResponse {
  success: boolean;
  confidence?: number; // ex: 99.8
  message?: string;
}

/**
 * Envoie une requête POST à l'API pour démarrer la vérification biométrique.
 * Le backend communique avec le lecteur d'empreinte (ex: ZKTeco) et retourne le résultat.
 * Route backend : POST /api/biometric/verify
 */
const verifyBiometric = async (): Promise<BiometricVerifyResponse> => {
  const { data } = await apiClient.post<BiometricVerifyResponse>(
    `${API_ROUTES.BIOMETRIC}/verify`,
    {}
  );

  if (!data.success) {
    throw new Error(data.message ?? 'Échec de la vérification biométrique.');
  }

  return data;
};

interface UseVerifyBiometricOptions {
  onSuccess?: (data: BiometricVerifyResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook pour déclencher la validation biométrique via le scanner.
 *
 * Usage :
 *   const { mutate, isPending, isError, reset } = useVerifyBiometric({
 *     onSuccess: () => setValue('biometricValidated', true),
 *   });
 */
export const useVerifyBiometric = (options?: UseVerifyBiometricOptions) => {
  return useMutation({
    mutationFn: verifyBiometric,
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error('Erreur biométrique:', error.message);
      options?.onError?.(error);
    },
  });
};
