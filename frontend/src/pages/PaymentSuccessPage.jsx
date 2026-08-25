import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';

export default function PaymentSuccessPage() {
  useEffect(() => {
    // Attempt to refresh user data from backend in a real app
    // For now, we'll just update the local state assuming payment was successful
    const user = userService.getCurrentUser();
    if (user && !user.isVip) {
      userService.updateCurrentUser({ ...user, isVip: true });
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0b1320',
      color: '#dce8f5',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{ fontSize: '4rem' }}>🎉</div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4ade80', marginBottom: '1rem' }}>Thanh toán thành công!</h1>
      <p style={{ fontSize: '1.1rem', color: '#a8bcd4', marginBottom: '2.5rem' }}>
        Cảm ơn bạn đã ủng hộ. Tài khoản của bạn đã được nâng cấp lên VIP.
      </p>
      <Link
        to="/account-settings"
        style={{
          background: '#2563eb',
          color: 'white',
          padding: '0.8rem 2rem',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'background 0.2s'
        }}
      >
        Quay về trang tài khoản
      </Link>
    </div>
  );
}