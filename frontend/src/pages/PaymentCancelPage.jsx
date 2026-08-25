import React from 'react';
import { Link } from 'react-router-dom';

export default function PaymentCancelPage() {
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
      <div style={{ fontSize: '4rem' }}>😞</div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f87171', marginBottom: '1rem' }}>Giao dịch đã bị hủy</h1>
      <p style={{ fontSize: '1.1rem', color: '#a8bcd4', marginBottom: '2.5rem' }}>
        Bạn đã hủy giao dịch thanh toán. Nếu đây là một sự nhầm lẫn, bạn có thể thử lại.
      </p>
      <Link
        to="/account-settings"
        style={{
          background: '#4a5568',
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