import { ThemeProvider, type DefaultTheme } from 'styled-components';
import { darkTheme, lightTheme } from '../styles/theme';

interface ThemeProviderProps {
    children: React.ReactNode;
}

const isDarkMode = true;

export const AppThemeProvider = ({ children }: ThemeProviderProps) => {
    return <ThemeProvider theme={(isDarkMode ? darkTheme : lightTheme) as DefaultTheme}>{children}</ThemeProvider>;
};