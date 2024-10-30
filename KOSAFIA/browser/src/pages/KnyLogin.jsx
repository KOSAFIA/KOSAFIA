// src/pages/LoginPage.js
import React from 'react';
import LoginForm from '../components/KnyComponents/KnyLoginForm';
import '../styles/kny/Loginkny.css';

const LoginPage = () => {
    // 로그인 성공 핸들러
    const handleLoginSuccess = (userData) => {
        // 로그인 성공 후 처리 (예: 라우팅, 상태 업데이트 등)
        console.log('로그인 성공:', userData);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h1 className="login-title">Welcome Back!</h1>
                <LoginForm onLoginSuccess={handleLoginSuccess} />
            </div>
        </div>
    );
};

export default LoginPage;