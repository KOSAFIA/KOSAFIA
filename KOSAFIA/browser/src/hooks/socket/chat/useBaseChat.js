// hooks/base/useBaseChat.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useBaseSocket } from '../../../contexts/socket/BaseSocketContext';
export const useBaseChat = ({ topic, destination }) => {
    const { connected, subscribe, publish } = useBaseSocket();
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!connected) return;

        const subscription = subscribe(topic, (message) => {
            console.log('Received message:', message);
            setMessages(prev => [...prev, message]);
        });

        return () => subscription?.unsubscribe();
    }, [topic, connected, subscribe]);

    const sendMessage = useCallback((message) => {
        if (!connected) return false;
        
        // 메시지 직접 전송 - 추가 래핑 없이
        return publish(destination, message);
    }, [connected, publish, destination]);

    return {
        connected,
        messages,
        sendMessage
    };
};

// useBaseChat:

// 기본적인 WebSocket 메시지 처리
// 메시지 목록 상태 관리
// 구독 관리
// 메시지 전송
// 연결 상태 제공
// 메시지 초기화 기능