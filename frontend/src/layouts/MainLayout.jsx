import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import HomeNavbar from '../components/home/HomeNavbar';
import Footer from '../components/common/Footer';

export default function MainLayout() {
  const [search, setSearch] = useState('');
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setLoggedIn(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080f1e' }}>
      <HomeNavbar
        search={search}
        setSearch={setSearch}
        loggedIn={loggedIn}
        setLoggedIn={setLoggedIn}
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet context={{ search, setSearch, loggedIn, setLoggedIn }} />
      </main>
      <Footer />
    </div>
  );
}
