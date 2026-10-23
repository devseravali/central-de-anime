import { useState, type ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { darkTheme, lightTheme, type ThemeMode } from '../styles/theme';
import { ThemeContext } from './ThemeContext';

interface ThemeProviderProps {
    children: ReactNode;
}

const THEME_STORAGE_KEY = 'central-de-anime-theme';

interface ThemePreference {
    mode: ThemeMode;
    storageError: string | null;
}

const readThemePreference = (): ThemePreference => {
    try {
        const savedMode = localStorage.getItem(THEME_STORAGE_KEY);

        if (savedMode === 'dark' || savedMode === 'light') {
            return { mode: savedMode, storageError: null };
        }

        if (savedMode !== null) {
            console.warn('Preferência de tema inválida; usando o tema escuro.');
        }

        return { mode: 'dark', storageError: null };
    } catch (error) {
        if (!(error instanceof DOMException)) {
            throw error;
        }

        console.error('Não foi possível ler a preferência de tema:', error);
        return {
            mode: 'dark',
            storageError: 'Não foi possível restaurar a preferência de tema neste navegador.',
        };
    }
};

export const AppThemeProvider = ({ children }: ThemeProviderProps) => {
    const [preference, setPreference] = useState(readThemePreference);

    const toggleTheme = () => {
        const mode = preference.mode === 'dark' ? 'light' : 'dark';
        let storageError: string | null = null;

        try {
            localStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
            if (!(error instanceof DOMException)) {
                throw error;
            }

            console.error('Não foi possível salvar a preferência de tema:', error);
            storageError = 'Tema alterado, mas a preferência não pôde ser salva neste navegador.';
        }

        setPreference({ mode, storageError });
    };

    return (
        <ThemeContext.Provider value={{ ...preference, toggleTheme }}>
            <ThemeProvider theme={preference.mode === 'dark' ? darkTheme : lightTheme}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};