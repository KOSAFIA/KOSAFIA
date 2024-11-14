import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs'; // eslint-disable-line
import axios from 'axios';

// 상수 정의
const WEBSOCKET_URL = 'http://localhost:8080/wstomp';
const API_BASE_URL = 'http://localhost:8080/api';
const GAME_STATUS = {
    NONE: 'NONE',
    DAY: 'DAY',
    NIGHT: 'NIGHT',
    VOTE: 'VOTE',
    FINALVOTE: 'FINALVOTE',
    DELAY: 'DELAY'
};

// 게임 컨텍스트 생성
const GameSocketContext = createContext();

// 웹소켓 구독 핸들러 생성
const createSubscriptionHandlers = (client, roomKey, handlers) => {
    console.log('웹소켓 구독 핸들러 생성 시작...');
    
    // 일반 채팅 구독
    client.subscribe(`/topic/game.chat.${roomKey}`, (message) => {
        const chatMessage = JSON.parse(message.body);
        handlers.onChatMessage(chatMessage);
    });

    // 마피아 채팅 구독 (마피아인 경우)
    if (handlers.isMafia) {
        client.subscribe(`/topic/game.chat.mafia.${roomKey}`, (message) => {
            const chatMessage = JSON.parse(message.body);
            handlers.onMafiaChatMessage({ ...chatMessage, isMafiaChat: true });
        });
    }

    // 게임 상태 구독
    client.subscribe(`/topic/game.state.${roomKey}`, (message) => {
        try {
            const response = JSON.parse(message.body);
            handlers.onGameStateUpdate(response);
        } catch (error) {
            console.error('게임 상태 업데이트 처리 중 오류:', error);
        }
    });

    // 마피아 타겟 구독
    client.subscribe(`/topic/game.mafia.target.${roomKey}`, (message) => {
        const { targetId } = JSON.parse(message.body);
        handlers.onMafiaTargetUpdate(targetId);
    });

    // 플레이어 상태 구독
    client.subscribe(`/topic/game.players.${roomKey}`, (message) => {
        try {
            const response = JSON.parse(message.body);
            handlers.onPlayerStateUpdate(response);
        } catch (error) {
            console.error('플레이어 상태 업데이트 처리 중 오류:', error);
        }
    });

    console.log('웹소켓 구독 핸들러 생성 완료');
};

export const GameSocketProvider = ({ roomKey, children }) => {
    // 상태 관리
    const [messages, setMessages] = useState([]);
    const [players, setPlayers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [gameStatus, setGameStatus] = useState(GAME_STATUS.NIGHT);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [mafiaTarget, setMafiaTarget] = useState(null);
    const [voteStatus, setVoteStatus] = useState({});
    
    const clientRef = useRef(null);

    // 게임 초기화
    const initializeGame = useCallback(async () => {
        try {
            console.log('게임 초기화 시작...');
            const response = await axios.get(
                `${API_BASE_URL}/rooms/${roomKey}`,
                { withCredentials: true }
            );
            
            if (response.data) {
                setGameStatus(response.data.gameStatus);
                setPlayers(response.data.players);
                
                const playerData = sessionStorage.getItem('player');
                if (playerData) {
                    const currentPlayerData = JSON.parse(playerData);
                    const updatedPlayer = response.data.players.find(
                        p => p.playerNumber === currentPlayerData.playerNumber
                    );
                    if (updatedPlayer) {
                        setCurrentPlayer(updatedPlayer);
                        console.log('현재 플레이어 정보 업데이트 완료');
                    }
                }
            }
            console.log('게임 초기화 완료');
        } catch (error) {
            console.error('게임 초기화 실패:', error);
            throw error;
        }
    }, [roomKey]);

    // 채팅 가능 여부 확인
    const canChat = useCallback(() => {
        console.log('채팅 가능 여부 확인:', {
            게임상태: gameStatus,
            플레이어역할: currentPlayer?.role
        });

        if (!gameStatus || !currentPlayer) return false;
        
        switch (gameStatus) {
            case GAME_STATUS.DELAY:
            case GAME_STATUS.VOTE:
                return false;
            case GAME_STATUS.FINALVOTE:
                return currentPlayer.isVoteTarget;
            case GAME_STATUS.NIGHT:
                return currentPlayer.role === 'MAFIA';
            case GAME_STATUS.DAY:
                return true;
            default:
                return false;
        }
    }, [gameStatus, currentPlayer]);

    // 채팅 메시지 전송
    const sendGameMessage = useCallback((content) => {
        if (!content?.trim()) {
            console.log('메시지가 비어있습니다');
            return;
        }

        if (!canChat()) {
            console.log('현재 채팅이 불가능한 상태입니다', {
                게임상태: gameStatus,
                플레이어역할: currentPlayer?.role
            });
            return;
        }

        if (isConnected && clientRef.current) {
            try {
                console.log('채팅 메시지 전송 시도:', {
                    사용자: currentPlayer?.username,
                    내용: content,
                    게임상태: gameStatus
                });

                const chatMessage = {
                    username: currentPlayer?.username,
                    content: content,
                    gameStatus: gameStatus,
                    role: currentPlayer?.role,
                    roomKey: parseInt(roomKey)
                };

                // 밤에는 마피아 채팅으로 전송
                const destination = gameStatus === 'NIGHT' && currentPlayer?.role === 'MAFIA'
                    ? `/fromapp/game.chat.send/${roomKey}`
                    : `/fromapp/game.chat.send/${roomKey}`;

                clientRef.current.publish({
                    destination,
                    body: JSON.stringify(chatMessage)
                });

                console.log('채팅 메시지 전송 완료');
            } catch (error) {
                console.error('채팅 메시지 전송 실패:', error);
            }
        }
    }, [isConnected, currentPlayer, gameStatus, roomKey, canChat]);

    // 마피아의 타겟 선택 가능 여부 확인
    const canSelectTarget = useCallback(() => {
        const isMafia = currentPlayer?.role === 'MAFIA';
        const isNightTime = gameStatus === 'NIGHT';
        
        console.log('마피아 타겟 선택 가능 여부 확인:', {
            마피아여부: isMafia,
            밤시간여부: isNightTime,
            게임상태: gameStatus
        });
        
        return isMafia && isNightTime;
    }, [currentPlayer?.role, gameStatus]);

    // 마피아 타겟 설정 함수
    const setTarget = useCallback((targetId) => {
        if (!canSelectTarget()) {
            console.log('타겟 설정 불가: 마피아가 아니거나 밤이 아님', {
                역할: currentPlayer?.role,
                게임상태: gameStatus
            });
            return;
        }

        if (!isConnected || !clientRef.current) {
            console.log('타겟 설정 실패: 연결 상태 확인 필요');
            return;
        }

        // 자기 자신을 타겟으로 선택할 수 없음
        if (targetId === currentPlayer.playerNumber) {
            console.log('자기 자신을 타겟으로 선택할 수 없습니다');
            return;
        }

        try {
            console.log('마피아 타겟 설정 시도:', {
                마피아번호: currentPlayer.playerNumber,
                타겟번호: targetId,
                방번호: roomKey
            });

            const targetMessage = {
                mafiaId: currentPlayer.playerNumber,
                targetId: targetId,
                roomKey: parseInt(roomKey)
            };

            // 타겟 정보 전송 (다른 마피아들과 공유)
            clientRef.current.publish({
                destination: `/fromapp/game.mafia.target/${roomKey}`,
                body: JSON.stringify(targetMessage)
            });

            // 로컬 상태 업데이트
            setMafiaTarget(targetId);
            console.log('마피아 타겟 설정 완료');
        } catch (error) {
            console.error('마피아 타겟 설정 실패:', error);
        }
    }, [isConnected, currentPlayer, roomKey, gameStatus, canSelectTarget]);

    // 투표 가능 여부 체크 함수
    const canVote = useCallback(() => {
        console.log('투표 가능 여부 확인:', {
            게임상태: gameStatus,
            연결상태: isConnected
        });
        return gameStatus === 'VOTE' && isConnected;
    }, [gameStatus, isConnected]);

    // 투표 함수
    const sendVote = useCallback((targetId) => {
        if (!canVote()) {
            console.log('투표 불가: 투표 시간이 아니거나 연결되지 않음');
            return;
        }

        try {
            console.log('투표 시도:', {
                투표자: currentPlayer?.playerNumber,
                타겟: targetId,
                방번호: roomKey
            });

            const voteMessage = {
                voterId: currentPlayer?.playerNumber,
                targetId: targetId,
                roomKey: parseInt(roomKey)
            };

            clientRef.current?.publish({
                destination: `/fromapp/game.vote/${roomKey}`,
                body: JSON.stringify(voteMessage)
            });
        } catch (error) {
            console.error('투표 전송 실패:', error);
        }
    }, [canVote, currentPlayer, roomKey]);

    // 웹소켓 연결 설정
    useEffect(() => {
        console.log('웹소켓 연결 시작...');
        
        const client = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            debug: (str) => console.log('웹소켓 디버그:', str),
            
            onConnect: async () => {
                try {
                    console.log('웹소켓 연결 성공');
                    setIsConnected(true);
                    await initializeGame();

                    // 일반 채팅 구독
                    console.log('일반 채팅 구독 시작...');
                    client.subscribe(`/topic/game.chat.${roomKey}`, (message) => {
                        try {
                            const chatMessage = JSON.parse(message.body);
                            console.log('일반 채팅 메시지 수신:', chatMessage);
                            setMessages(prev => [...prev, chatMessage]);
                        } catch (error) {
                            console.error('채팅 메시지 처리 중 오류:', error);
                        }
                    });

                    // 마피아 채팅 구독
                    if (currentPlayer?.role === 'MAFIA') {
                        console.log('마피아 채팅 구독 시작...');
                        client.subscribe(`/topic/game.chat.mafia.${roomKey}`, (message) => {
                            try {
                                const chatMessage = JSON.parse(message.body);
                                console.log('마피아 채팅 메시지 수신:', chatMessage);
                                setMessages(prev => [...prev, { ...chatMessage, isMafiaChat: true }]);
                            } catch (error) {
                                console.error('마피아 채팅 메시지 처리 중 오류:', error);
                            }
                        });
                    }

                    // 게임 상태 구독
                    client.subscribe(`/topic/game.state.${roomKey}`, (message) => {
                        try {
                            const response = JSON.parse(message.body);
                            if (response.success) {
                                setGameStatus(response.gameStatus);
                                setPlayers(response.players);
                                updateCurrentPlayer(response.players);
                            }
                        } catch (error) {
                            console.error('게임 상태 업데이트 처리 중 오류:', error);
                        }
                    });

                    // 플레이어 상태 구독
                    client.subscribe(`/topic/game.players.${roomKey}`, (message) => {
                        try {
                            const response = JSON.parse(message.body);
                            if (response.success) {
                                setPlayers(response.players);
                                updateCurrentPlayer(response.players);
                            }
                        } catch (error) {
                            console.error('플레이어 상태 업데이트 처리 중 오류:', error);
                        }
                    });

                    // 마피아 타겟 구독 (마피아인 경우에만)
                    if (currentPlayer?.role === 'MAFIA') {
                        console.log('마피아 타겟 구독 시작...');
                        client.subscribe(`/topic/game.mafia.target.${roomKey}`, (message) => {
                            try {
                                const targetMessage = JSON.parse(message.body);
                                console.log('마피아 타겟 업데이트 수신:', {
                                    설정한마피아: targetMessage.mafiaId,
                                    타겟번호: targetMessage.targetId
                                });
                                
                                // 다른 마피아가 선택한 타겟으로 상태 업데이트
                                setMafiaTarget(targetMessage.targetId);
                            } catch (error) {
                                console.error('마피아 타겟 메시지 처리 중 오류:', error);
                            }
                        });
                    }

                    // 투표 현황 구독
                    client.subscribe(`/topic/game.vote.${roomKey}`, (message) => {
                        try {
                            const voteData = JSON.parse(message.body);
                            console.log('투표 현황 업데이트:', voteData);
                            setVoteStatus(voteData.voteStatus);
                        } catch (error) {
                            console.error('투표 현황 처리 중 오류:', error);
                        }
                    });

                } catch (error) {
                    console.error('웹소켓 연결 중 오류:', error);
                    setIsConnected(false);
                }
            },
            
            onDisconnect: () => {
                console.log('웹소켓 연결 종료');
                setIsConnected(false);
            }
        });

        clientRef.current = client;
        client.activate();

        return () => {
            if (client.active) {
                console.log('웹소켓 연결 정리 중...');
                client.deactivate();
            }
        };
    }, [roomKey, initializeGame, currentPlayer?.role]);

    // 테스트용 메서드들 추가
    const updateGameStatus = useCallback(async (newStatus) => {
        try {
            console.log('게임 상태 업데이트 시도:', { roomKey, newStatus });
            
            // HTTP 요청 먼저 수행
            const response = await axios.post(
                `${API_BASE_URL}/game/admin/status`,
                {
                    roomKey: parseInt(roomKey),
                    gameStatus: newStatus
                },
                { withCredentials: true }
            );

            if (response.status === 200 && response.data) {
                console.log('HTTP 요청 성공, 소켓 메시지 전송 시도');
                
                // HTTP 요청 성공 시에만 소켓 메시지 전송
                clientRef.current?.publish({
                    destination: `/fromapp/game.state.update/${roomKey}`,
                    body: JSON.stringify({ gameStatus: newStatus })
                });
                
                // 로컬 상태는 소켓 응답에서 업데이트될 것이므로 여기서는 하지 않음
                return response.data;
            }
        } catch (error) {
            console.error('게임 상태 변경 실패:', error);
            throw error;
        }
    }, [roomKey]);

    // 플레이어 상태 업데이트 함수
    const updatePlayerStatus = useCallback(async (playerNumber, { isAlive, role }) => {
        try {
            console.log('플레이어 상태 업데이트 시도:', { 
                방번호: roomKey, 
                플레이어번호: playerNumber, 
                생존여부: isAlive, 
                역할: role 
            });
            
            // HTTP 요청 먼저 수행
            const response = await axios.post(
                `${API_BASE_URL}/game/admin/player/update`,
                {
                    roomKey: parseInt(roomKey),
                    playerNumber: parseInt(playerNumber),
                    isAlive,
                    role
                },
                { withCredentials: true }
            );

            if (response.status === 200 && response.data) {
                console.log('HTTP 요청 성공, 소켓 메시지 전송 시도');
                
                // HTTP 요청 성공 시에만 소켓 메시지 전송
                clientRef.current?.publish({
                    destination: `/fromapp/game.players.update/${roomKey}`,
                    body: JSON.stringify({
                        playerNumber: parseInt(playerNumber),
                        isAlive,
                        role
                    })
                });
                
                // 로컬 상태는 소켓 응답에서 업데이트될 것이므로 여기서는 하지 않음
                return response.data;
            }
        } catch (error) {
            console.error('플레이어 상태 업데이트 실패:', error);
            throw error;
        }
    }, [roomKey]);

    // 현재 플레이어 정보 업데이트 헬퍼 함수
    const updateCurrentPlayer = (players) => {
        const playerData = sessionStorage.getItem('player');
        if (playerData) {
            const currentPlayerData = JSON.parse(playerData);
            const updatedPlayer = players.find(
                p => p.playerNumber === currentPlayerData.playerNumber
            );
            if (updatedPlayer) {
                setCurrentPlayer(updatedPlayer);
                sessionStorage.setItem('player', JSON.stringify(updatedPlayer));
            }
        }
    };

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
        updatePlayerStatus,
        voteStatus,
        canVote,
        sendVote
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
        throw new Error('GameSocketProvider 내부에서만 사용할 수 있습니다');
    }
    return context;
};
