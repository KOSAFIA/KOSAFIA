// src/components/LoginForm.js
import React, { useState } from 'react';
import '../../styles/kny/LoginForm.css';

const LoginForm = ({ onLoginSuccess }) => {
    // 폼 상태 관리
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // 에러 상태 관리
    const [error, setError] = useState('');
    
    // 로딩 상태 관리
    const [isLoading, setIsLoading] = useState(false);

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // 에러 메시지 초기화
        setError('');
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 이메일 유효성 검사
            if (!formData.email.includes('@')) {
                throw new Error('유효한 이메일을 입력해주세요.');
            }

            // 비밀번호 유효성 검사
            if (formData.password.length < 6) {
                throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
            }

            // API 호출
            const response = await fetch('/api/knylogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('로그인에 실패했습니다.');
            }

            const data = await response.json();
            onLoginSuccess(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
                <label htmlFor="email">이메일</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">비밀번호</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                />
            </div>

            <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
            >
                {isLoading ? '로그인 중...' : '로그인'}
            </button>
        </form>
    );
};

export default LoginForm;