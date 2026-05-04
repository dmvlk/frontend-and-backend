import React, { useState, useEffect } from 'react';
import Login from './pages/Auth/Login';
import ProductsPage from './pages/Products/ProductsPage';
import UsersPage from './pages/Users/UsersPage';
import PushNotification from './components/PushNotification';
import { api } from './api';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const user = await api.getMe();
            setIsAuthenticated(true);
            setUserRole(user.role);
            setUserData(user);
        } catch (err) {
            setIsAuthenticated(false);
            setUserRole(null);
            setUserData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        checkAuth();
    };

    const handleLogout = async () => {
        await api.logout();
        setIsAuthenticated(false);
        setUserRole(null);
        setUserData(null);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <p>Загрузка...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="app">
            <header className="app-header">
                <h1 className="app-title">Кофейная лавка</h1>
                <div className="header-controls">
                    <PushNotification />
                    <button className="logout-btn" onClick={handleLogout}>
                        Выйти
                    </button>
                </div>
            </header>
            
            <main className="app-main">
                {userRole === 'admin' ? (
                    <UsersPage userRole={userRole} userData={userData} />
                ) : (
                    <ProductsPage userRole={userRole} userData={userData} />
                )}
            </main>
        </div>
    );
}

export default App;