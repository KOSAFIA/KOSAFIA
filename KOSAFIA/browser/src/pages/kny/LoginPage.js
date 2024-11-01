import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/kny/oldstable/UserContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useUser();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
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
            console.log("Login response:", data); // 디버깅용

            
            // // Context를 통해 로그인 처리
            // // 세션 스토리지에 사용자 정보 저장
            // sessionStorage.setItem('USER_ID', data.userId);
            // sessionStorage.setItem('USER_EMAIL', data.email);
            // sessionStorage.setItem('USERNAME', data.username);
            // sessionStorage.setItem('SESSION_ID', data.sessionId);


            // login({
            //     userId: data.userId,
            //     username: data.username,
            //     email: data.email
            // });

            // 로그인 처리
            if (data && data.userId) {
                login({
                    userId: data.userId,
                    username: data.username,
                    email: data.email
                });
                
                // 로비 페이지로 이동
                navigate('/react/lobby');
            } else {
                throw new Error('Invalid login response data');
            }

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
        }
    };


    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                    {error}
                </div>
            )}
            <div>
                <input
                    type="email"
                    name="email"
                    placeholder="이메일"
                    value={formData.email}
                    onChange={(e) => setFormData({
                        ...formData,
                        email: e.target.value
                    })}
                />
            </div>
            <div>
                <input
                    type="password"
                    name="password"
                    placeholder="비밀번호"
                    value={formData.password}
                    onChange={(e) => setFormData({
                        ...formData,
                        password: e.target.value
                    })}
                />
            </div>
            <button type="submit">로그인</button>
        </form>
    );
};

export default LoginPage;