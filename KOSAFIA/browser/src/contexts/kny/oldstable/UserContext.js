import React, { createContext, useState, useContext, useCallback } from 'react';

// Context 생성
const UserContext = createContext();

// Context Provider 컴포넌트
export const UserProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    // // 로그인 함수
    // const login = useCallback((userData) => {
    //     console.log("Setting user data:", userData); // 디버깅용
    //     setUser(userData);
    // }, []);

    // useCallback 없이 일반 함수로 정의
    const login = (userData) => {
        console.log("로그인 시도:", userData);
        setUser(userData);
    };    

    const value = {
        user,
        login,
        logout: useCallback(() => setUser(null), [])
    }

    // 로그아웃 함수
    const logout = () => {
        sessionStorage.clear();
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ value }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom Hook
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};