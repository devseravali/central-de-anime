import { createContext, useContext } from 'react';
import type { ThemeMode } from '../styles/theme';

interface ThemeContextValue {
    mode: ThemeMode;
    toggleTheme: () => void;
    storageError: string | null;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useAppTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useAppTheme deve ser usado dentro de AppThemeProvider.');
    }

    return context;
};
