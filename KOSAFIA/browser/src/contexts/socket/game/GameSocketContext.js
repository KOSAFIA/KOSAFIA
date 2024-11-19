/* eslint-disable import/no-unresolved */
import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { GAME_STATUS } from '../../../constants/GameStatus';
import { CONFIG, API_BASE_URL, WEBSOCKET_URL } from '../../../config/Config';

const GameSocketContext = createContext(null);

export const GameSocketProvider = ({ roomKey, children }) => {
  const clientRef = useRef(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [gameStatus, setGameStatus] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [dayCount, setDayCount] = useState(1);
  const [mafiaTarget, setMafiaTarget] = useState(null);
  const [voteStatus, setVoteStatus] = useState({});
  const [finalVotes, setFinalVotes] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);

  // publishMessage를 먼저 선언
  const publishMessage = useCallback((type, payload = {}) => {
    if (!clientRef.current) return;
    clientRef.current.publish({
      destination: `/fromapp/${type}/${roomKey}`,
      body: JSON.stringify(payload)
    });
  }, [roomKey]);

  // 그 다음이 게임 액션 함수들
  const startGame = useCallback(() => {
    if (!isHost) return;
    publishMessage(CONFIG.SOCKET_PUBLISH.GAME_START);
}, [isHost, publishMessage]);

const setTarget = useCallback((targetId) => {
    if (!clientRef.current || currentPlayer?.role !== "MAFIA") return;
    publishMessage(CONFIG.SOCKET_PUBLISH.MAFIA_TARGET, {
        mafiaId: currentPlayer.playerNumber,
        targetId
    });
}, [currentPlayer, publishMessage]);

const sendVote = useCallback((targetId) => {
    if (!clientRef.current || !currentPlayer) return;
    publishMessage(CONFIG.SOCKET_PUBLISH.VOTE, {
        voterId: currentPlayer.playerNumber,
        targetId
    });
}, [currentPlayer, publishMessage]);

const processVoteResult = useCallback(async () => {
    if (!isHost) throw new Error("방장만 투표 결과를 처리할 수 있습니다.");
    await publishMessage(CONFIG.SOCKET_PUBLISH.VOTE_RESULT);
    return { success: true };
}, [isHost, publishMessage]);

const processFinalVoteResult = useCallback(async () => {
    if (!isHost) throw new Error("방장만 최종 투표 결과를 처리할 수 있습니다.");
    await publishMessage(CONFIG.SOCKET_PUBLISH.FINAL_VOTE_RESULT);
    return { success: true };
}, [isHost, publishMessage]);

const processNightResult = useCallback(async () => {
    if (!isHost) throw new Error("방장만 밤 결과를 처리할 수 있습니다.");
    await publishMessage(CONFIG.SOCKET_PUBLISH.NIGHT_RESULT);
    return { success: true };
}, [isHost, publishMessage]);

  const handleGameStart = useCallback((message) => {
    console.log("게임 시작 메시지 수신:", message);
    try {
        const response = JSON.parse(message.body);
        if (!response.success) {
            console.error("게임 시작 실패:", response.message);
            return;
        }
        setIsPlaying(true);
        setGameStatus(response.gameStatus);
        
        // 타이머 초기화 및 시작
        publishMessage(CONFIG.SOCKET_PUBLISH.GAME_TIMER);
        
        console.log("게임 시작 완료 및 타이머 시작");
    } catch (error) {
        console.error("게임 시작 메시지 처리 실패:", error);
    }
}, [publishMessage]);

// 게임 상태 업데이트 함수 추가
const updateGameStatus = useCallback((nextStatus) => {
  console.log("게임 상태 업데이트 요청:", { 
      currentStatus: gameStatus, 
      nextStatus 
  });
  
  // 서버에 상태 변경 요청
  publishMessage(CONFIG.SOCKET_PUBLISH.GAME_STATE_CHANGE, {
      currentStatus: gameStatus,
      nextStatus: nextStatus
  });
}, [gameStatus, publishMessage]);

  // 소켓 연결 및 초기화
  useEffect(() => {
    if (!roomKey) return;
    let isInitialized = false;

    const initializeClient = async () => {
      try {
        if (isInitialized) return;
        
        const playerData = JSON.parse(sessionStorage.getItem("player"));
        if (!playerData) {
          throw new Error("플레이어 데이터를 찾을 수 없습니다");
        }

        const client = new Client({
          webSocketFactory: () => new SockJS(WEBSOCKET_URL),
          reconnectDelay: CONFIG.RECONNECT_DELAY,
          heartbeatIncoming: CONFIG.HEARTBEAT_INCOMING,
          heartbeatOutgoing: CONFIG.HEARTBEAT_OUTGOING,
          maxRetries: 10,
          onConnect: async () => {
            console.log("소켓 연결 성공");
            setIsConnected(true);
            try {
              await initializeGameData(playerData);
              isInitialized = true;
              console.log("초기화 완료, 구독 준비됨");
            } catch (error) {
              console.error("게임 데이터 초기화 중 오류:", error);
              setIsConnected(false);
              isInitialized = false;
            }
          },
          onStompError: (frame) => {
            console.error("STOMP 에러:", frame);
            setIsConnected(false);
            isInitialized = false;
          }
        });

        if (typeof client.watchConnection === 'function') {
          client.watchConnection((connected) => {
            if (!connected) {
              setIsConnected(false);
              console.log("서버와의 연결이 끊어졌습니다. 재연결을 시도합니다.");
            }
          });
        }

        clientRef.current = client;
        await client.activate();
        
      } catch (error) {
        console.error("소켓 초기화 실패:", error);
        setIsConnected(false);
        isInitialized = false;
      }
    };

    const timer = setTimeout(initializeClient, 1000);
    
    return () => {
      clearTimeout(timer);
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
      isInitialized = false;
    };
  }, [roomKey]);

  // 구독 설정
  useEffect(() => {
    if (!isConnected || !clientRef.current || !roomKey || !currentPlayer) return;

    const subscriptions = [
      clientRef.current.subscribe(`/topic/game.timer.${roomKey}`, handleTimerUpdate),
      clientRef.current.subscribe(`/topic/game.chat.${roomKey}`, handleChatMessage),
      clientRef.current.subscribe(`/topic/game.state.${roomKey}`, handleGameState),
      clientRef.current.subscribe(`/topic/game.vote.${roomKey}`, handleVoteUpdate),
      clientRef.current.subscribe(`/topic/game.players.${roomKey}`, handlePlayersUpdate),
      clientRef.current.subscribe(`/topic/game.sound.${roomKey}`, handleSoundEffect),
      clientRef.current.subscribe(`/topic/game.mafia.target.${roomKey}`, handleMafiaTarget),
      clientRef.current.subscribe(`/topic/game.start.${roomKey}`, handleGameStart),
      clientRef.current.subscribe(`/topic/game.night.result.${roomKey}`, handleNightResult),
      clientRef.current.subscribe(`/topic/game.vote.result.${roomKey}`, handleVoteResult),
      clientRef.current.subscribe(`/topic/game.finalvote.result.${roomKey}`, handleFinalVoteResult),
      clientRef.current.subscribe(`/topic/game.players.update.${roomKey}`, handlePlayerUpdate)
    ];

    if (currentPlayer.role === 'MAFIA') {
      subscriptions.push(
        clientRef.current.subscribe(`/topic/game.chat.mafia.${roomKey}`, handleMafiaChat)
      );
    }

    return () => subscriptions.forEach(sub => sub.unsubscribe());
  }, [isConnected, roomKey, currentPlayer]);

  // 메시지 전송 함수들
  const sendGameMessage = useCallback((message, isMafiaChat = false) => {
    if (!clientRef.current || !currentPlayer) return;
    
    const destination = isMafiaChat ? 
      `/fromapp/game.chat.mafia/${roomKey}` : 
      `/fromapp/game.chat/${roomKey}`;

    clientRef.current.publish({
      destination,
      body: JSON.stringify({
        username: currentPlayer.username,
        content: message,
        gameStatus,
        role: currentPlayer.role,
        roomKey,
        playerNumber: currentPlayer.playerNumber,
        type: isMafiaChat ? 'MAFIA' : 'NORMAL',
        soundUrl: null,
        imageUrl: null
      })
    });
  }, [roomKey, currentPlayer, gameStatus]);

  // 시스템 메시지 전송
  const sendSystemMessage = useCallback((content) => {
    if (!clientRef.current) return;
    
    clientRef.current.publish({
      destination: `/fromapp/game.chat/${roomKey}`,
      body: JSON.stringify({
        username: 'System',
        content,
        gameStatus,
        role: 'SYSTEM',
        roomKey,
        playerNumber: 0,
        type: 'SYSTEM',
        soundUrl: null,
        imageUrl: null
      })
    });
  }, [roomKey, gameStatus]);

  // 이벤트 메시지 전송 (투표, 사망 등의 게임 이벤트)
  const sendEventMessage = useCallback((content, eventType) => {
    if (!clientRef.current) return;
    
    clientRef.current.publish({
      destination: `/fromapp/game.chat/${roomKey}`,
      body: JSON.stringify({
        username: 'System',
        content,
        gameStatus,
        role: 'SYSTEM',
        roomKey,
        playerNumber: 0,
        type: eventType,  // 'VOTE_EVENT', 'DEATH_EVENT' 등
        soundUrl: null,
        imageUrl: null
      })
    });
  }, [roomKey, gameStatus]);



  // 게임 데이터 초기화
  const initializeGameData = async (playerData) => {
    try {
      console.log("게임 데이터 초기화 시작:", { playerData, roomKey });
      
      // 1. 현재 플레이어 설정
      setCurrentPlayer(playerData);
      
      // 2. 방 정보 가져오기
      const response = await axios.get(`${API_BASE_URL}/api/rooms/${roomKey}`);
      const roomData = response.data;
      console.log("방 정보 로드됨:", roomData);
      
      // 3. 기본 데이터 설정 - username으로 호스트 체크
      setIsHost(playerData.username === roomData.hostName);
      setPlayers(roomData.players);
      setGameStatus(roomData.gameStatus);
      setGameTime(roomData.currentTime);
      setDayCount(roomData.dayCount);
      
      console.log("게임 데이터 초기화 완료", {
        isHost: playerData.username === roomData.hostName,
        currentPlayer: playerData,
        players: roomData.players,
        gameStatus: roomData.gameStatus
      });

    } catch (error) {
      console.error("게임 데이터 초기화 실패:", error);
      throw error;
    }
  };

  // 메시지 핸들러들
  const handleChatMessage = useCallback((message) => {
    try {
      const chatMessage = JSON.parse(message.body);
      // 메시지 중복 체크
      setMessages(prev => {
        const isDuplicate = prev.some(msg => 
          msg.content === chatMessage.content && 
          msg.playerNumber === chatMessage.playerNumber &&
          msg.timestamp === chatMessage.timestamp
        );
        if (isDuplicate) return prev;
        return [...prev, chatMessage];
      });
    } catch (error) {
      console.error("채팅 메시지 처리 실패:", error);
    }
  }, []);

  const handleMafiaChat = useCallback((message) => {
    const chatMessage = JSON.parse(message.body);
    setMessages(prev => [...prev, { ...chatMessage, isMafiaChat: true }]);
  }, []);

// handleTimerUpdate 수정
const handleTimerUpdate = useCallback((message) => {
  if (!message.body) return;
  
  try {
      const response = JSON.parse(message.body);
      if (!response.success) {
          console.error("타이머 업데이트 실패:", response.message);
          return;
      }

      console.log("타이머 업데이트:", response);
      setGameTime(response.currentTime);
      if (response.gameStatus) {
          setGameStatus(response.gameStatus);
      }
  } catch (error) {
      console.error("타이머 업데이트 처리 실패:", error);
  }
}, []);

  const handleGameState = useCallback((message) => {
    console.log("게임 상태 업데이트 수신:", message);
    const { gameStatus: newStatus, dayCount: newDay } = JSON.parse(message.body);
    setGameStatus(newStatus);
    if (newDay) setDayCount(newDay);
  }, []);

  const handleVoteUpdate = useCallback((message) => {
    const { voteStatus: newVotes, isFinalVote } = JSON.parse(message.body);
    if (isFinalVote) {
      setFinalVotes(newVotes);
    } else {
      setVoteStatus(newVotes);
    }
  }, []);

  const handlePlayersUpdate = useCallback((message) => {
    const updatedPlayers = JSON.parse(message.body);
    setPlayers(updatedPlayers);
  }, []);

  const handleSoundEffect = useCallback((message) => {
    const soundEffect = JSON.parse(message.body);
    // Handle sound effect update logic here
  }, []);

  const handleMafiaTarget = useCallback((message) => {
    const { mafiaId, targetId } = JSON.parse(message.body);
    setMafiaTarget(targetId);
  }, []);

  const handleNightResult = useCallback((message) => {
    console.log("밤 결과 수신:", message);
    // Handle night result logic here
  }, []);

  const handleVoteResult = useCallback((message) => {
    console.log("투표 결과 수신:", message);
    // Handle vote result logic here
  }, []);

  const handleFinalVoteResult = useCallback((message) => {
    console.log("최종 투표 결과 수신:", message);
    // Handle final vote result logic here
  }, []);

  const handlePlayerUpdate = useCallback((message) => {
    console.log("플레이어 업데이트 수신:", message);
    // Handle player update logic here
  }, []);

  const createSystemMessage = useCallback((content) => ({
    content,
    playerNumber: 0,
    username: "System",
    role: "SYSTEM",
    type: "SYSTEM",
    gameStatus: gameStatus,
    roomKey: roomKey,
    soundUrl: null,
    imageUrl: null
  }), [gameStatus, roomKey]);

  const canVote = useCallback(() => {
    return gameStatus === GAME_STATUS.VOTE && currentPlayer?.isAlive;
  }, [gameStatus, currentPlayer]);

  const canChat = useCallback(() => {
    if (!currentPlayer?.isAlive) return false;
    if (gameStatus === GAME_STATUS.NIGHT) {
      return currentPlayer.role === 'MAFIA';
    }
    return true;
  }, [currentPlayer, gameStatus]);
  const handleTimerEnd = useCallback(async () => {
    if (!isHost) return;

    console.log("타이머 종료 이벤트:", { 
        gameStatus, 
        currentTime: gameTime 
    });
    
    const currentStatus = gameStatus;
    switch (currentStatus) {
        case GAME_STATUS.NIGHT:
            await handleNightEnd();
            break;
        case GAME_STATUS.DAY:
            await handleDayEnd();
            break;
        case GAME_STATUS.VOTE:
            await handleVoteEnd();
            break;
        case GAME_STATUS.FINALVOTE:
            await handleFinalVoteEnd();
            break;
        default:
            break;
    }
}, [isHost, gameStatus, gameTime]);

const handleNightEnd = async () => {
    console.log("밤 시간 종료 처리 시작");
    sendSystemMessage("밤이 끝났습니다.");
    await handleStageChange(GAME_STATUS.DELAY);
    await processNightResult();
};

const handleDayEnd = async () => {
    console.log("낮 시간 종료 처리 시작");
    sendSystemMessage("낮이 끝났습니다. 투표를 시작합니다.");
    await handleStageChange(GAME_STATUS.DELAY);
};

const handleVoteEnd = async () => {
    console.log("투표 시간 종료 처리 시작");
    const result = await processVoteResult();
    if (result.success) {
        sendSystemMessage("투표가 종료되었습니다.");
        await handleStageChange(GAME_STATUS.DELAY);
    }
};

const handleFinalVoteEnd = async () => {
    console.log("최종 투표 시간 종료 처리 시작");
    await processFinalVoteResult();
    sendSystemMessage("최종 투표가 종료되었습니다.");
    await handleStageChange(GAME_STATUS.DELAY);
};

const handleStageChange = useCallback(async (nextStatus) => {
    publishMessage(CONFIG.SOCKET_PUBLISH.GAME_STATE_CHANGE, {
        currentStatus: gameStatus,
        nextStatus: nextStatus
    });
}, [gameStatus, publishMessage]);


  useEffect(() => {
    if (!clientRef.current || !roomKey || !isPlaying) return;

    // 타이머 구독
    const timerSubscription = clientRef.current.subscribe(
      `/topic/game.timer.${roomKey}`,
      handleTimerUpdate
    );

    // 게임이 시작되면 타이머 시작 요청
    if (isPlaying) {
      publishMessage(CONFIG.SOCKET_PUBLISH.GAME_TIMER);
    }

    return () => {
      timerSubscription?.unsubscribe();
    };
  }, [roomKey, isPlaying, clientRef.current]);

  const value = {
    messages, 
    players, 
    gameStatus, 
    currentPlayer, 
    mafiaTarget,
    voteStatus, 
    finalVotes, 
    isConnected, 
    isHost, 
    gameTime, 
    dayCount,
        // 개별 함수들로 전달
    startGame,
    setTarget,
    sendVote,
    processVoteResult,
    processFinalVoteResult,
    processNightResult,
    sendGameMessage,
    canVote,
    canChat,
    sendSystemMessage,
    modifyGameTime: useCallback((adjustment) => 
      publishMessage(CONFIG.SOCKET_PUBLISH.TIMER_MODIFY, { 
        playerNumber: currentPlayer?.playerNumber, 
        adjustment 
      })
    , [currentPlayer, publishMessage]),
    setGameTime,
    updateGameStatus,
  };

  return <GameSocketContext.Provider value={value}>{children}</GameSocketContext.Provider>;
};

export const useGameContext = () => {
  const context = useContext(GameSocketContext);
  if (!context) throw new Error("GameSocketProvider 내부에서만 사용할 수 있습니다");
  return context;
};
