import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { API_ROUTES } from '@/config/api';

export interface AccountSuggestion {
  id: string | number;
  numeroCompte: string;
  nom?: string;
  prenom?: string;
  initials: string;
  typeCompte?: string;
}

interface UseAccountSearchParams {
  onSelect: (suggestion: AccountSuggestion) => void;
}

/**
 * Hook personnalisé pour la recherche de comptes avec autocomplétion
 */
export const useAccountSearch = ({ onSelect }: UseAccountSearchParams) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AccountSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Récupérer les suggestions basées sur la requête
  const { isLoading: isSearching } = useQuery({
    queryKey: ['accountSearch', query],
    queryFn: async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return [];
      }

      try {
        const { data } = await apiClient.get<any[]>(
          `${API_ROUTES.MEMBRES}?search=${query}`
        );

        const formatted = data.map((m) => ({
          id: m.id || m.numeroCompte,
          numeroCompte: m.numeroCompte,
          nom: m.nom,
          prenom: m.prenom,
          initials: `${(m.prenom || '').charAt(0)}${(m.nom || '').charAt(0)}`.toUpperCase(),
          typeCompte: m.typeCompte,
        }));

        setSuggestions(formatted);
        setIsOpen(true);
        return formatted;
      } catch (error) {
        console.error('Erreur lors de la recherche de comptes:', error);
        setSuggestions([]);
        return [];
      }
    },
    enabled: query.length >= 2,
  });

  const selectSuggestion = useCallback(
    (suggestion: AccountSuggestion) => {
      onSelect(suggestion);
      setQuery('');
      setSuggestions([]);
      setIsOpen(false);
    },
    [onSelect]
  );

  const closeSuggestions = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    suggestions,
    isSearching,
    isOpen,
    setQuery,
    selectSuggestion,
    closeSuggestions,
    inputRef,
  };
};
