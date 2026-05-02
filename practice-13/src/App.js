import React, { useState, useEffect } from 'react';
import Login from './pages/Auth/Login';
import ProductsPage from './pages/Products/ProductsPage';
import UsersPage from './pages/Users/UsersPage';
import { api } from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    api.getMe()
      .then(user => {
        setIsAuthenticated(true);
        setUserRole(user.role);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUserRole(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50, color: '#8b5a2b' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => {
      api.getMe().then(user => {
        setIsAuthenticated(true);
        setUserRole(user.role);
      }).catch(() => {
        setIsAuthenticated(false);
      });
    }} />;
  }

  if (userRole === 'admin') {
    return <UsersPage userRole={userRole} />;
  }

  return <ProductsPage userRole={userRole} />;
}

export default App;