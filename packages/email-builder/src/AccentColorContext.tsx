import { createContext, useContext } from 'react';

const AccentColorContext = createContext<string | null>(null);

export default AccentColorContext;

export function useAccentColor() {
  return useContext(AccentColorContext);
}
