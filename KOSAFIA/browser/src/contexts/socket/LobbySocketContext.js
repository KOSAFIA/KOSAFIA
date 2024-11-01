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
// contexts/kny/socket/LobbySocketContext.js
import React, { createContext, useContext, useEffect } from 'react';
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

const LobbySocketContext = createContext(null);

const LobbyInnerProvider = ({ children }) => {
    const baseSocket = useBaseSocket();
    const sessionUser = JSON.parse(sessionStorage.getItem('USER_INFO'));

    // 로비 입장 시 자동으로 입장 메시지 전송
    useEffect(() => {
        if (baseSocket.connected && sessionUser) {
            baseSocket.publish(LOBBY_CONFIG.destinations.enter, {
                type: 'ENTER',
                userId: sessionUser.userId,
                username: sessionUser.username,
                timestamp: new Date().toISOString()
            });

            // 언마운트 시 퇴장 메시지 전송
            return () => {
                baseSocket.publish(LOBBY_CONFIG.destinations.leave, {
                    type: 'LEAVE',
                    userId: sessionUser.userId,
                    username: sessionUser.username,
                    timestamp: new Date().toISOString()
                });
            };
        }
    }, [baseSocket.connected, sessionUser]);

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

export const LobbySocketProvider = ({ children }) => {
    return (
        <BaseSocketProvider config={LOBBY_CONFIG}>
            <LobbyInnerProvider>
                {children}
            </LobbyInnerProvider>
        </BaseSocketProvider>
    );
};

export const useLobbySocket = () => {
    const context = useContext(LobbySocketContext);
    if (!context) {
        throw new Error('useLobbySocket must be used within LobbySocketProvider');
    }
    return context;
};