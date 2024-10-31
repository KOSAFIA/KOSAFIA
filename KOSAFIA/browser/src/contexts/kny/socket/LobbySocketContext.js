// LobbySocketContext:

// BaseSocketContext 확장
// 로비 전용 설정
// 입장/퇴장 자동 처리
// 세션 사용자 정보 관리
// 로비 전용 메시지 포맷


// 메시지 타입:

// ENTER: 입장
// LEAVE: 퇴장
// CHAT: 채팅


// 구독 토픽:

// /topic/lobby: 채팅
// /topic/users: 사용자 목록
// /topic/rooms: 방 목록

/// contexts/kny/socket/LobbySocketContext.js
import React, { createContext, useContext } from 'react';
import { BaseSocketProvider, useBaseSocket } from './BaseSocketContext';

// 로비 설정
const LOBBY_CONFIG = {
    endpoint: '/wstomp',
    topics: {
        chat: '/topic/lobby',
        users: '/topic/users',
        rooms: '/topic/rooms'
    },
    destinations: {
        chat: '/fromapp/lobby.chat',
        enter: '/fromapp/lobby.enter',
        leave: '/fromapp/lobby.leave'
    }
};

// 로비 컨텍스트 생성
const LobbySocketContext = createContext(null);

// 로비 프로바이더
export const LobbySocketProvider = ({ children }) => {
    return (
        <BaseSocketProvider config={LOBBY_CONFIG}>
            <LobbyInnerProvider>
                {children}
            </LobbyInnerProvider>
        </BaseSocketProvider>
    );
};

// 내부 프로바이더
const LobbyInnerProvider = ({ children }) => {
    const baseSocket = useBaseSocket();
    const sessionUser = JSON.parse(sessionStorage.getItem('USER_INFO'));

    const value = {
        ...baseSocket,
        topics: LOBBY_CONFIG.topics,
        destinations: LOBBY_CONFIG.destinations,
        sessionUser
    };

    return (
        <LobbySocketContext.Provider value={value}>
            {children}
        </LobbySocketContext.Provider>
    );
};

// 로비 소켓 훅
export const useLobbySocket = () => {
    const context = useContext(LobbySocketContext);
    if (!context) {
        throw new Error('useLobbySocket must be used within LobbySocketProvider');
    }
    return context;
};