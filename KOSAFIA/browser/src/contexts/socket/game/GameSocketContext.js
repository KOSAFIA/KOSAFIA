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

    const roomInfo = { roomKey: roomKey , player: sessionStorage.getItem("player")};

    // 게임 초기화 함수를 추가해요
    const initializeGame = useCallback(async () => {
        try {
            // 서버에서 방 정보 가져오기
            const response = await axios.get(
                `http://localhost:8080/api/rooms/${roomKey}`,
                { withCredentials: true }
            );
            
            if (response.data) {
                setGameStatus(response.data.gameStatus);
                setPlayers(response.data.players);
                // 현재 플레이어 찾기
                const playerData = sessionStorage.getItem('player');
                if (playerData) {
                    const currentPlayerData = JSON.parse(playerData);
                    const updatedPlayer = response.data.players.find(
                        p => p.playerNumber === currentPlayerData.playerNumber
                    );
                    if (updatedPlayer) {
                        setCurrentPlayer(updatedPlayer);
                    }
                }
            }
        } catch (error) {
            console.error('게임 초기화 실패:', error);
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
            console.log('채팅 불가 - 상태:', gameStatus, '역할:', currentPlayer?.role);
            return;
        }

        if (isConnected && clientRef.current) {
            try {
                const chatMessage = {
                    username: currentPlayer?.username,
                    content,
                    roomKey,
                    gameStatus,
                    role: currentPlayer?.role
                };

                console.log('채팅 메시지 전송 시도:', chatMessage);

                clientRef.current.publish({
                    destination: `/fromapp/game.chat.send/${roomKey}`,
                    body: JSON.stringify(chatMessage)
                });

                console.log('채팅 메시지 전송 완료');
            } catch (error) {
                console.error('채팅 메시지 전송 실패:', error);
            }
        } else {
            console.warn('채팅 불가 - 연결 상태:', isConnected);
        }
    }, [isConnected, roomKey, gameStatus, currentPlayer, canChat]);

    // 마피아가 타겟을 고르는 함수예요
    const setTarget = useCallback((targetId) => {
        if (currentPlayer?.role !== 'MAFIA' || gameStatus !== 'NIGHT') {
            console.log('마피아가 아니거나 밤이 아니라서 선택할 수 없어요');
            return;
        }

        if (isConnected && clientRef.current) {
            const targetMessage = {
                mafiaId: currentPlayer.playerNumber,
                targetId,
                roomKey
            };

            console.log('마피아 타겟 선택:', targetMessage);

            clientRef.current.publish({
                destination: `/fromapp/game.mafia.target/${roomKey}`,
                body: JSON.stringify(targetMessage)
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
                    try {
                        console.log('채팅 메시지 수신:', message);
                        const chatMessage = JSON.parse(message.body);
                        console.log('파싱된 채팅 메시지:', chatMessage);
                        
                        if (!chatMessage.username || !chatMessage.content) {
                            console.error('잘못된 채팅 메시지 형식:', chatMessage);
                            return;
                        }

                        setMessages(prev => [...prev, chatMessage]);
                        console.log('채팅 메시지 목록 업데이트 완료');
                    } catch (error) {
                        console.error('채팅 메시지 처리 중 오류:', error);
                    }
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

    // 테스트용 메서드들 추가
    const updateGameStatus = useCallback(async (newStatus) => {
        try {
            await axios.post('http://localhost:8080/api/game/admin/status', {
                roomKey,
                gameStatus: newStatus
            }, { withCredentials: true });
        } catch (error) {
            console.error('게임 상태 변경 실패:', error);
        }
    }, [roomKey]);

    // 플레이어 상태 업데이트 함수 통합
    const updatePlayerStatus = useCallback(async (playerNumber, updates) => {
        try {
            console.log('플레이어 상태 업데이트 시도:', {
                playerNumber,
                updates
            });

            const response = await axios.post(
                'http://localhost:8080/api/game/admin/player/update',
                {
                    roomKey,
                    playerNumber,
                    ...updates  // { isAlive?: boolean, role?: string }
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                console.log('플레이어 상태 업데이트 성공:', response.data);
                // 서버에서 업데이트된 전체 방 정보를 받아서 상태 업데이트
                setPlayers(response.data.players);
            } else {
                console.error('플레이어 상태 업데이트 실패:', response.data.message);
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('플레이어 상태 업데이트 중 오류:', error);
            throw error;
        }
    }, [roomKey]);

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
        initializeGame,
        // 테스트용 메서드
        updateGameStatus,
        updatePlayerStatus
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
