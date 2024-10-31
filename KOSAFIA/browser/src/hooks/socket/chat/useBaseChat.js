// hooks/base/useBaseChat.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useBaseSocket } from '../../../contexts/kny/socket/BaseSocketContext';
export const useBaseChat = ({ topic, destination }) => {
    // 메시지 목록 상태
    const [messages, setMessages] = useState([]);
    // 소켓 컨텍스트에서 필요한 기능들 가져오기
    const { connected, subscribe, publish } = useBaseSocket();
    // 구독 객체 참조 저장
    const subscription = useRef(null);

    // 메시지 수신 시 처리할 콜백
    const handleMessage = useCallback((message) => {
        setMessages(prev => [...prev, message]);
    }, []);

    // 토픽 구독 설정
    useEffect(() => {
        if (!connected || !topic) return;

        // 이전 구독 해제
        if (subscription.current) {
            subscription.current.unsubscribe();
        }

        // 새로운 구독 설정
        subscription.current = subscribe(topic, handleMessage);

        // 컴포넌트 언마운트 시 구독 해제
        return () => {
            if (subscription.current) {
                subscription.current.unsubscribe();
                subscription.current = null;
            }
        };
    }, [connected, topic, subscribe, handleMessage]);

    // 메시지 전송 함수
    const sendMessage = useCallback((content) => {
        if (!connected || !destination) {
            console.warn('Cannot send message: not connected or no destination');
            return false;
        }

        return publish(destination, {
            content,
            timestamp: new Date().toISOString()
        });
    }, [connected, destination, publish]);

    // 메시지 목록 초기화
    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        sendMessage,
        clearMessages,
        connected
    };
};

// useBaseChat:

// 기본적인 WebSocket 메시지 처리
// 메시지 목록 상태 관리
// 구독 관리
// 메시지 전송
// 연결 상태 제공
// 메시지 초기화 기능