import React, { useState, useEffect } from 'react';
import Login from './pages/Auth/Login';
import ProductsPage from './pages/Products/ProductsPage';
import { api } from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.getMe().then(() => {
        setIsAuthenticated(true);
      }).catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50, color: '#8b5a2b' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return <ProductsPage />;
}

export default App;