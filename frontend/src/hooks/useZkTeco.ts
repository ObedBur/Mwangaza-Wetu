import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';

/**
 * Hook pour gérer la capture d'empreinte biométrique via ZKTeco
 */
export const useZkTeco = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scanError, setScanError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  /**
   * Lance la capture d'empreinte biométrique
   * L'appareil ZKTeco enregistrera l'empreinte et retournera l'userId
   */
  const scanFingerprint = async () => {
    setIsScanning(true);
    setScanStatus('scanning');
    setScanError(null);

    try {
      // Appeler la capture d'empreinte via ZKTeco
      const response = await apiClient.post('/zkteco/capture-fingerprint', {});

      if (response.data?.userId) {
        const capturedId = String(response.data.userId);

        // --- NOUVEAU: Vérifier si cet ID est déjà utilisé en base ---
        try {
          const checkRes = await apiClient.get(`/membres/check-userid/${capturedId}`);
          if (checkRes.data?.exists) {
            setScanError('id existe deja ressayer !');
            setScanStatus('error');
            return;
          }
        } catch (e) {
          console.warn('Impossible de vérifier l\'unicité de l\'ID, continuation...', e);
        }

        setUserId(capturedId);
        setScanStatus('success');
      } else {
        setScanError('Aucun utilisateur identifié. Réessayez.');
        setScanStatus('error');
      }
    } catch (error: any) {
      // Récupérer le message d'erreur du backend
      const backendMessage = error?.data?.message || error?.response?.data?.message;
      let errorMessage = 'Erreur lors de la capture';

      if (backendMessage) {
        errorMessage = backendMessage;
      } else if (error?.message?.includes('timeout') || error?.code === 'ECONNABORTED') {
        errorMessage = 'Placez le doigt encore ou réessayez';
      } else {
        // Log l'erreur complète seulement si ce n'est pas un message métier connu
        console.error('Erreur technique capture empreinte:', error);
      }

      setScanError(errorMessage);
      setScanStatus('error');
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Réinitialiser l'état
   */
  const reset = () => {
    setIsScanning(false);
    setScanStatus('idle');
    setScanError(null);
    setUserId(null);
  };

  return {
    isScanning,
    scanStatus,
    scanError,
    userId,
    scanFingerprint,
    reset,
  };
};
