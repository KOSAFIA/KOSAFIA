import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axios from 'axios';

const GameSocketContext = createContext();

export const GameProvider = ({ roomKey, children }) => {
    // 기본 상태 관리
    const [messages, setMessages] = useState([]);
    const [players, setPlayers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [gameState, setGameState] = useState('WAITING'); // NIGHT, DAY, VOTE, FINAL_VOTE, DELAY
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [mafiaTarget, setMafiaTarget] = useState(null);
    
    const clientRef = useRef(null);
    const messageQueue = useRef([]);

    // 게임 상태에 따른 채팅 가능 여부 확인
    const canChat = useCallback(() => {
        if (gameState === 'DELAY') return false;
        if (gameState === 'VOTE') return false;
        if (gameState === 'FINAL_VOTE') {
            return currentPlayer?.isVoteTarget;
        }
        if (gameState === 'NIGHT') {
            return currentPlayer?.role === 'MAFIA';
        }
        return gameState === 'DAY';
    }, [gameState, currentPlayer]);

    // 채팅 메시지 전송
    const sendMessage = useCallback((content) => {
        if (!canChat()) {
            console.warn('현재 채팅이 불가능한 상태입니다.');
            return;
        }

        if (isConnected && clientRef.current) {
            const chatMessage = {
                username: currentPlayer.username,
                content,
                roomKey,
                gameState,
                role: currentPlayer.role
            };

            clientRef.current.publish({
                destination: `/fromapp/game.chat.send/${roomKey}`,
                body: JSON.stringify(chatMessage)
            });
        }
    }, [isConnected, roomKey, gameState, currentPlayer, canChat]);

    // 마피아 타겟 지정
    const setTarget = useCallback((targetId) => {
        if (currentPlayer?.role !== 'MAFIA' || gameState !== 'NIGHT') return;

        if (isConnected && clientRef.current) {
            const targetMessage = {
                mafiaId: currentPlayer.id,
                targetId,
                roomKey
            };

            clientRef.current.publish({
                destination: `/fromapp/game.mafia.target/${roomKey}`,
                body: JSON.stringify(targetMessage)
            });
        }
    }, [isConnected, roomKey, currentPlayer, gameState]);

    // 구독 설정
    const setupSubscriptions = useCallback((client) => {
        // 채팅 메시지 구독
        const chatSubscription = client.subscribe(
            `/topic/game.chat.${roomKey}`, 
            message => {
                const chatMessage = JSON.parse(message.body);
                if (gameState === 'NIGHT' && currentPlayer?.role !== 'MAFIA') {
                    return; // 밤에는 마피아 채팅만 표시
                }
                setMessages(prev => [...prev, chatMessage]);
            }
        );

        // 마피아 타겟 동기화 구독
        const targetSubscription = client.subscribe(
            `/topic/game.mafia.target.${roomKey}`,
            message => {
                if (currentPlayer?.role === 'MAFIA') {
                    const { targetId } = JSON.parse(message.body);
                    setMafiaTarget(targetId);
                }
            }
        );

        // 게임 상태 변경 구독
        const stateSubscription = client.subscribe(
            `/topic/game.state.${roomKey}`,
            message => {
                const { state } = JSON.parse(message.body);
                setGameState(state);
            }
        );

        return () => {
            chatSubscription.unsubscribe();
            targetSubscription.unsubscribe();
            stateSubscription.unsubscribe();
        };
    }, [roomKey, gameState, currentPlayer]);

    // ... WebSocket 연결 설정 (RoomContext와 유사)

    const value = {
        messages,
        players,
        isConnected,
        gameState,
        currentPlayer,
        mafiaTarget,
        canChat,
        sendMessage,
        setTarget
    };

    return (
        <GameSocketContext.Provider value={value}>
            {children}
        </GameSocketContext.Provider>
    );
};

export const useGameSocketContext = () => {
    const context = useContext(GameSocketContext);
    if (!context) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
}; 