// contexts/Base/BaseSocketContext.js
// 주요 특징과 기능:

// BaseSocketContext:

// 웹소켓 연결 관리
// 구독 관리
// 메시지 발행
// 에러 처리
// 재연결 로직

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// 컨텍스트 생성
const BaseSocketContext = createContext(null);

// 프로바이더 컴포넌트
export const BaseSocketProvider = ({ children, config }) => {
    // 웹소켓 클라이언트 참조
    const client = useRef(null);
    // 연결 상태
    const [connected, setConnected] = useState(false);
    // 구독 목록 관리
    const subscriptions = useRef(new Map());

    useEffect(() => {
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(`http://localhost:8080${config.endpoint}`),
            debug: str => console.log('STOMP Debug:', str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        // 연결 성공 핸들러
        stompClient.onConnect = () => {
            console.log('STOMP Connected');
            setConnected(true);
        };

        // 연결 해제 핸들러
        stompClient.onDisconnect = () => {
            console.log('STOMP Disconnected');
            setConnected(false);
        };

        // 에러 핸들러
        stompClient.onStompError = (frame) => {
            console.error('STOMP Error:', frame);
        };

        client.current = stompClient;
        stompClient.activate();

        // 클린업
        return () => {
            subscriptions.current.forEach(sub => sub.unsubscribe());
            subscriptions.current.clear();
            if (client.current?.connected) {
                client.current.deactivate();
            }
        };
    }, [config.endpoint]);

    // 구독 메서드
    const subscribe = (topic, callback) => {
        if (!client.current?.connected) {
            console.warn('Cannot subscribe: client not connected');
            return null;
        }

        const subscription = client.current.subscribe(topic, message => {
            try {
                const data = JSON.parse(message.body);
                callback(data);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });

        subscriptions.current.set(topic, subscription);
        return subscription;
    };

    // 메시지 발행 메서드
    const publish = (destination, message) => {
        if (!client.current?.connected) {
            console.warn('Cannot publish: client not connected');
            return false;
        }

        try {
            client.current.publish({
                destination,
                body: JSON.stringify(message)
            });
            return true;
        } catch (error) {
            console.error('Error publishing message:', error);
            return false;
        }
    };

    // 컨텍스트 값
    const value = {
        connected,
        subscribe,
        publish,
        client: client.current
    };

    return (
        <BaseSocketContext.Provider value={value}>
            {children}
        </BaseSocketContext.Provider>
    );
};

// 커스텀 훅
export const useBaseSocket = () => {
    const context = useContext(BaseSocketContext);
    if (!context) {
        throw new Error('useBaseSocket must be used within BaseSocketProvider');
    }
    return context;
};