// Powered by OnSpace.AI
import { useContext } from 'react';
import { TableGamesContext } from '@/contexts/TableGamesContext';

export function useTableGames() {
  const ctx = useContext(TableGamesContext);
  if (!ctx) throw new Error('useTableGames must be used within TableGamesProvider');
  return ctx;
}
