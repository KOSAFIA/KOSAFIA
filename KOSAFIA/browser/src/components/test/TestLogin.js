// components/TestLogin.js
import React, { useEffect } from 'react';

const TestLogin = () => {
    useEffect(() => {
        // 세션에 사용자 정보가 없을 때만 생성
        if (!sessionStorage.getItem('USER_INFO')) {
            const testUser = {
                userId: `test_${Date.now()}`,
                userEmail: `test${Date.now()}@test.com`,
                username: `TestUser${Math.floor(Math.random() * 1000)}`,
                status: 1,
                createdAt: new Date().toISOString()
            };
            
            sessionStorage.setItem('USER_INFO', JSON.stringify(testUser));

            console.log("유저 정보라고 하는데 난 개소리 같아요 맞아요?");
            console.log(testUser);
            console.log( JSON.stringify(testUser));
        }
    }, []);

    return null;  // 이 컴포넌트는 UI를 렌더링하지 않음
};

export default TestLogin;