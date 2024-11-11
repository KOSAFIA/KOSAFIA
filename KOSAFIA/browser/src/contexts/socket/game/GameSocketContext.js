import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs'; // eslint-disable-line
import axios from 'axios';

// 게임에서 필요한 모든 정보를 담는 상자를 만들어요
const GameSocketContext = createContext();

export const GameSocketProvider = ({ roomKey, children }) => {
    // 게임에 필요한 정보들을 준비해요
    const [messages, setMessages] = useState([]);
    const [players, setPlayers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [gameStatus, setGameStatus] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [mafiaTarget, setMafiaTarget] = useState(null);
    
    const clientRef = useRef(null);

    // 게임 초기화 함수를 추가해요
    const initializeGame = useCallback(async () => {
        try {
            // 서버에서 현재 게임 상태와 플레이어 정보를 가져와요
            const response = await axios.get(
                `http://localhost:8080/api/game/current-data`,
                { withCredentials: true }
            );
            
            setGameStatus(response.data.gameStatus);
            setPlayers(response.data.players);
            setCurrentPlayer(response.data.currentPlayer);

            console.log('게임 정보를 가져왔어요:', {
                상태: response.data.gameStatus,
                플레이어목록: response.data.players,
                내정보: response.data.currentPlayer
            });
        } catch (error) {
            console.error('게임 정보를 가져오는데 실패했어요:', error);
        }
    }, [roomKey]);

    // 채팅이 가능한지 확인하는 함수예요
    const canChat = useCallback(() => {
        console.log('채팅 가능 여부 확인 중...', {
            게임상태: gameStatus,
            현재플레이어: currentPlayer?.role
        });

        if (gameStatus === 'DELAY') return false;
        if (gameStatus === 'VOTE') return false;
        if (gameStatus === 'FINAL_VOTE') return currentPlayer?.isVoteTarget;
        if (gameStatus === 'NIGHT') return currentPlayer?.role === 'MAFIA';
        return gameStatus === 'DAY';
    }, [gameStatus, currentPlayer]);

    // 메시지를 보내는 함수예요
    const sendGameMessage = useCallback((content) => {
        if (!canChat()) {
            console.log('지금은 채팅을 할 수 없어요!');
            return;
        }

        if (isConnected && clientRef.current) {
            const chatMessage = {
                username: currentPlayer?.username,
                content,
                roomKey,
                gameStatus,
                role: currentPlayer?.role
            };

            clientRef.current.publish({
                destination: `/fromapp/game.chat.send/${roomKey}`,
                body: JSON.stringify(chatMessage)
            });
        }
    }, [isConnected, roomKey, gameStatus, currentPlayer, canChat]);

    // 마피아가 타겟을 고르는 함수예요
    const setTarget = useCallback((targetId) => {
        if (currentPlayer?.role !== 'MAFIA' || gameStatus !== 'NIGHT') {
            console.log('마피아가 아니거나 밤이 아니라서 선택할 수 없어요');
            return;
        }

        if (isConnected && clientRef.current) {
            console.log('마피아가 타겟을 골랐어요:', targetId);
            clientRef.current.publish({
                destination: `/fromapp/game.mafia.target/${roomKey}`,
                body: JSON.stringify({ mafiaId: currentPlayer.id, targetId, roomKey })
            });
        }
    }, [isConnected, roomKey, currentPlayer, gameStatus]);

    // 웹소켓 연결을 설정하는 부분이에요
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/wstomp'),
            debug: (str) => {
                console.log('웹소켓 디버그:', str);
            },
            onConnect: async () => {
                console.log('게임 서버와 연결되었어요!');
                setIsConnected(true);
                
                // 게임 초기화
                await initializeGame();
                
                // 게임 상태 구독
                client.subscribe(`/topic/game.state.${roomKey}`, (message) => {
                    const { gameStatus, players: updatedPlayers } = JSON.parse(message.body);
                    setGameStatus(gameStatus);
                    setPlayers(updatedPlayers);
                    console.log('게임 상태가 변경되었어요:', gameStatus);
                });

                // 채팅 메시지 구독
                client.subscribe(`/topic/game.chat.${roomKey}`, (message) => {
                    const chatMessage = JSON.parse(message.body);
                    setMessages(prev => [...prev, chatMessage]);
                    console.log('새로운 채팅 메시지:', chatMessage);
                });

                // 마피아 타겟 구독
                client.subscribe(`/topic/game.mafia.target.${roomKey}`, (message) => {
                    const { targetId, mafiaId } = JSON.parse(message.body);
                    if (currentPlayer?.role === 'MAFIA') {
                        setMafiaTarget(targetId);
                        console.log('마피아가 타겟을 변경했어요:', targetId);
                    }
                });

                // 플레이어 상태 변경 구독
                client.subscribe(`/topic/game.players.${roomKey}`, (message) => {
                    const updatedPlayers = JSON.parse(message.body);
                    setPlayers(updatedPlayers);
                    console.log('플레이어 목록이 업데이트되었어요:', updatedPlayers);
                });
            },
            onDisconnect: () => {
                console.log('게임 서버와 연결이 끊어졌어요');
                setIsConnected(false);
            }
        });

        clientRef.current = client;
        client.activate();

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [roomKey, initializeGame]);

    const value = {
        messages,
        players,
        isConnected,
        gameStatus,
        currentPlayer,
        mafiaTarget,
        canChat,
        sendGameMessage,
        setTarget,
        initializeGame
    };

    return (
        <GameSocketContext.Provider value={value}>
            {children}
        </GameSocketContext.Provider>
    );
};

// 게임 정보를 사용할 수 있게 해주는 함수예요
export const useGameContext = () => {
    const context = useContext(GameSocketContext);
    if (!context) {
        throw new Error('GameSocketProvider 안에서만 사용할 수 있어요!');
    }
    return context;
};
