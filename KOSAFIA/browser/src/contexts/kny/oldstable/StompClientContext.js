// contexts/StompClientContext.js
import React, { createContext, useContext } from 'react';
import UseStompClient from '../../../hooks/socket/UseStompClient'

const StompClientContext = createContext(null);

export const StompClientProvider = ({ children }) => {
    const stompClient = UseStompClient();  // 우리가 만든 훅 사용

    return (
        <StompClientContext.Provider value={stompClient}>
            {children}
        </StompClientContext.Provider>
    );
};

// 사용하기 쉽게 훅으로 만듦
export const useStompClientContext = () => {
    const context = useContext(StompClientContext);
    if (!context) {
        throw new Error('useStompClientContext must be used within a StompClientProvider');
    }
    return context;
};