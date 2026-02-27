import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

interface ZkTecoOptions {
  mode?: 'registration' | 'verification';
}

/**
 * Hook pour gérer la capture d'empreinte biométrique via ZKTeco
 */
export const useZkTeco = ({ mode = 'verification' }: ZkTecoOptions = {}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scanError, setScanError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  /**
   * Lance la capture d'empreinte biométrique
   */
  const scanFingerprint = async () => {
    setIsScanning(true);
    setScanStatus('scanning');
    setScanError(null);

    try {
      const response = await apiClient.post('/zkteco/capture-fingerprint', {});

      if (response.data?.userId) {
        const capturedId = String(response.data.userId);

        // --- Vérification d'existence selon le mode ---
        if (mode === 'registration') {
          try {
            const checkRes = await apiClient.get(`/membres/check-userid/${capturedId}`);
            if (checkRes.data?.exists) {
              setScanError('Cette empreinte est déjà enregistrée pour un autre membre !');
              setScanStatus('error');
              return;
            }
          } catch (e) {
            console.warn('Erreur lors de la vérification d\'unicité:', e);
          }
        }

        setUserId(capturedId);
        setScanStatus('success');
      } else {
        setScanError('Aucun doigt détecté ou erreur de lecture.');
        setScanStatus('error');
      }
    } catch (error: any) {
      const backendMessage = error?.data?.message || error?.response?.data?.message;
      let errorMessage = 'Erreur lors de la capture';

      if (backendMessage) {
        errorMessage = backendMessage;
      } else if (error?.message?.includes('timeout') || error?.code === 'ECONNABORTED') {
        errorMessage = 'Placez le doigt encore ou réessayez';
      }

      setScanError(errorMessage);
      setScanStatus('error');
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Réinitialiser l'état — mémoïsé avec useCallback pour éviter
   * les boucles infinies quand utilisé en dépendance d'un useEffect.
   */
  const reset = useCallback(() => {
    setIsScanning(false);
    setScanStatus('idle');
    setScanError(null);
    setUserId(null);
  }, []);

  return {
    isScanning,
    scanStatus,
    scanError,
    userId,
    scanFingerprint,
    reset,
  };
};
