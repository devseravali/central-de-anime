import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { GlobalStyle } from './styles/GlobalStyle.ts'
import { AppThemeProvider } from './providers/themeprovider.tsx'
import { AppQueryProvider } from './providers/AppQueryProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppThemeProvider>
        <AppQueryProvider>
          <GlobalStyle />
          <App />
        </AppQueryProvider>
      </AppThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
