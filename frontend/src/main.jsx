import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { RestaurantConfigProvider } from './context/RestaurantConfigContext.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RestaurantConfigProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </RestaurantConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
