import * as Sentry from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { App } from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { RestaurantConfigProvider } from './context/RestaurantConfigContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import './styles/theme.css';
import './styles/index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_NODE_ENV || 'development',
  enabled: !!import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: import.meta.env.VITE_NODE_ENV === 'production' ? 0.2 : 0.0,
  integrations: [Sentry.browserTracingIntegration()],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1
    }
  }
});

function SentryFallback({ error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <div className="glass-panel max-w-md p-8 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-600 text-2xl font-black">!</div>
        <h1 className="text-xl font-black tracking-tight">Algo salio mal</h1>
        <p className="mt-2 text-sm text-stone-600">Ocurrio un error inesperado.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => window.location.reload()} className="btn-primary">Recargar pagina</button>
        </div>
        {import.meta.env.DEV && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs font-semibold text-stone-400">Detalles tecnicos</summary>
            <pre className="mt-2 overflow-auto rounded bg-stone-100 p-3 text-xs text-stone-600">{error.message}</pre>
          </details>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={SentryFallback}>
      <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RestaurantConfigProvider>
                <ToastProvider>
                  <CartProvider>
                    <App />
                  </CartProvider>
                </ToastProvider>
              </RestaurantConfigProvider>
            </AuthProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </HelmetProvider>
      </ErrorBoundary>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
