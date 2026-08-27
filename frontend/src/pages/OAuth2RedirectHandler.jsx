import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export default function OAuth2RedirectHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
            localStorage.setItem('token', token);
            // Fetch user info and store it
            authService.getMe()
                .then(response => {
                    localStorage.setItem('user', JSON.stringify(response.data));
                    if (response.data?.role === 'ROLE_ADMIN') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/');
                    }
                })
                .catch(err => {
                    console.error("Could not fetch user info after oauth login", err);
                    navigate('/login?error=fetch_user_failed');
                });
        } else {
            navigate(`/login?error=${error || 'oauth_failed'}`);
        }
    }, [searchParams, navigate]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#0b1320',
            color: '#c8daf0'
        }}>
            Đang xử lý đăng nhập...
        </div>
    );
}