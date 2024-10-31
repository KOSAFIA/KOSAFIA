// hooks/lobby/useLobbyChat.js
import { useCallback } from 'react';
import { useBaseChat } from './useBaseChat';
import { useLobbySocket } from '../../../contexts/kny/socket/LobbySocketContext';

export const useLobbyChat = () => {
    // 로비 소켓 컨텍스트에서 설정값과 세션 정보 가져오기
    const { topics, sessionUser } = useLobbySocket();
    
    // 기본 채팅 훅 사용
    const {
        messages,
        sendMessage: baseSendMessage,
        clearMessages,
        connected
    } = useBaseChat({
        topic: topics.chat,          // /topic/lobby
        destination: '/fromapp/lobby.chat'
    });

    // 로비 채팅용 메시지 전송 함수
    const sendMessage = useCallback((content) => {
        if (!sessionUser) {
            console.warn('Cannot send message: No session user');
            return false;
        }

        // 로비 채팅 메시지 포맷으로 변환하여 전송
        return baseSendMessage({
            type: 'CHAT',
            userId: sessionUser.userId,
            username: sessionUser.username,
            content: content,
            timestamp: new Date().toISOString()
        });
    }, [sessionUser, baseSendMessage]);

    return {
        messages,
        sendMessage,
        clearMessages,
        connected
    };
};