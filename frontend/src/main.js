import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './context/DataContext.js';
import { AuthProvider } from './context/AuthContext.js';
import App from './App.js';
import './styles.css';
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { fontFamily: 'inherit', fontSize: 13, borderRadius: 10 },
              duration: 3500,
            }}
          />
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
