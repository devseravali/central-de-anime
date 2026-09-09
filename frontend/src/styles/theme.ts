import { breakpoints } from './breakpoints';
import { darkColors, lightColors } from './colors';
import { radii } from './radii';
import { darkShadows, lightShadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export const darkTheme = {
    colors: darkColors,
    typography,
    spacing,
    radii,
    breakpoints,
    shadows: darkShadows,
};

export const lightTheme = {
    colors: lightColors,
    typography,
    spacing,
    radii,
    breakpoints,
    shadows: lightShadows,
};

export type AppTheme = typeof darkTheme;