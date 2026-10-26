import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './context/DataContext.js';
import { AuthProvider } from './context/AuthContext.js';
import App from './App.js';
import { ThemeProvider } from './context/ThemeContext.js';
import './styles.css';
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <App />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  fontFamily: 'inherit',
                  fontSize: 13,
                  borderRadius: 10,
                  background: 'var(--color-card)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                },
                duration: 3500,
              }}
            />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
