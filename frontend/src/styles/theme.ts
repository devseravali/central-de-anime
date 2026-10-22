import { breakpoints } from './breakpoints';
import { darkColors, lightColors } from './colors';
import { radii } from './radii';
import { darkShadows, lightShadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export type ThemeMode = 'dark' | 'light';

export const darkTheme = {
    mode: 'dark' as const,
    colors: darkColors,
    typography,
    spacing,
    radii,
    breakpoints,
    shadows: darkShadows,
};

export const lightTheme = {
    mode: 'light' as const,
    colors: lightColors,
    typography,
    spacing,
    radii,
    breakpoints,
    shadows: lightShadows,
};

export type AppTheme = Omit<typeof darkTheme, 'mode'> & { mode: ThemeMode };