import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    html {
        scroll-behavior: smooth;
    }

    body {
        margin: 0;
        min-width: 320px;
        min-height: 100vh;

        background: ${({ theme }) => theme.colors.background};
        color: ${({ theme }) => theme.colors.textPrimary};

        font-family: ${({ theme }) => theme.typography.fontFamily.body};
        font-size: 16px;
        line-height: 1.5;

        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;

        transition:
            background-color 200ms ease,
            color 200ms ease;
    }

    button,
    input,
    textarea,
    select {
        font: inherit;
    }

    button {
        border: 0;
        cursor: pointer;
    }

    button:disabled {
        cursor: not-allowed;
    }

    input,
    textarea,
    select {
        outline: none;
    }

    a {
        color: inherit;
        text-decoration: none;
    }

    img,
    picture,
    video,
    canvas,
    svg {
        display: block;
        max-width: 100%;
    }

    ul,
    ol {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p {
        margin: 0;
    }

    ::selection {
        background: ${({ theme }) => theme.colors.primary};
        color: ${({ theme }) => theme.colors.white};
    }
`;