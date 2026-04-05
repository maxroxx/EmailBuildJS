import { createContext, useContext } from 'react';

export const AccentColorContext = createContext<string | null>(null);

export function useAccentColor() {
  return useContext(AccentColorContext);
}
