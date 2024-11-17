import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs"; // eslint-disable-line
import axios from "axios";
import { useRouteLoaderData } from "react-router-dom";

const WEBSOCKET_URL = "http://localhost:8080/wstomp";
const API_BASE_URL = "http://localhost:8080/api";
const GAME_STATUS = {
  NONE: "NONE",
  DAY: "DAY",
  NIGHT: "NIGHT",
  VOTE: "VOTE",
  FINALVOTE: "FINALVOTE",
  DELAY: "DELAY",
};

const GameSocketContext = createContext();

export const GameSocketProvider = ({ roomKey, children }) => {
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.NIGHT);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [mafiaTarget, setMafiaTarget] = useState(null);
  const [voteStatus, setVoteStatus] = useState({});
  const [isHost, setIsHost] = useState(false);
  const [finalVotes, setFinalVotes] = useState({
    agree: 0,
    disagree: 0,
  });

  const clientRef = useRef(null);

  const updateCurrentPlayer = useCallback(
    (updatedPlayers) => {
      if (!currentPlayer) {
        console.warn("현재 플레이어가 설정되지 않았습니다");
        return;
      }

      console.log("현재 플레이어 업데이트 시도:", {
        currentNumber: currentPlayer.playerNumber,
        updatedPlayers,
      });

      const updated = updatedPlayers.find(
        (p) => p.playerNumber === currentPlayer.playerNumber
      );
      if (updated) {
        console.log("현재 플레이어 업데이트 성공:", updated);
        setCurrentPlayer(updated);
      } else {
        console.warn(
          "현재 플레이어를 찾을 수 없음:",
          currentPlayer.playerNumber
        );
      }
    },
    [currentPlayer]
  );

  // 게임 사운드 부분
  useEffect(() => {
    if (!isConnected || !clientRef.current || !roomKey) return;

    const soundSubscription = clientRef.current.subscribe(
      `/topic/game.sound.${roomKey}`,
      (message) => {
        const { sound } = JSON.parse(message.body);

        // 소리 재생
        if (sound === "heal") {
          new Audio("/sound/heal.mp3").play();
          console.log("치료 소리 재생");
        } else if (sound === "gun") {
          new Audio("/sound/gun.mp3").play();
          console.log("비명 소리 재생");
        } 
      }
    );

    return () => soundSubscription.unsubscribe();
  }, [isConnected, roomKey]);

  useEffect(() => {
    if (!roomKey) {
      console.error("roomKey가 없습니다!");
      return;
    }

    let isInitialized = false;

    const initializeClient = async () => {
      try {
        if (isInitialized) return;

        const playerData = JSON.parse(sessionStorage.getItem("player"));
        if (!playerData) {
          console.error("플레이어 정보를 찾을 수 없습니다!");
          return;
        }

        console.log("게임 소켓 연결 초기화 시작...", playerData);
        isInitialized = true;

        const client = new Client({
          webSocketFactory: () => new SockJS(WEBSOCKET_URL),
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: async () => {
            console.log("인게임 웹소켓 연결 성공:", roomKey);

            setCurrentPlayer(playerData);
            console.log("현재 플레이어 설정:", playerData);

            setIsConnected(true);

            try {
              const hostResponse = await axios.post(
                `${API_BASE_URL}/game/host/${roomKey}`,
                { username: playerData.username },
                {
                  withCredentials: true,
                  headers: { "Content-Type": "application/json" },
                }
              );
              setIsHost(hostResponse.data);
              console.log("방장 여부:", hostResponse.data);

              const playersResponse = await axios.get(
                `${API_BASE_URL}/game/players/${roomKey}`,
                { withCredentials: true }
              );
              setPlayers(playersResponse.data);
              console.log("초기 플레이어 리스트:", playersResponse.data);

              client.publish({
                destination: `/fromapp/game.players.join/${roomKey}`,
                body: JSON.stringify(playerData),
              });
            } catch (error) {
              console.error("초기화 중 오류 발생:", error);
            }
          },
          onDisconnect: () => {
            console.log("인게임 웹소켓 연결 해제:", roomKey);
            setIsConnected(false);
            isInitialized = false;
          },
        });

        clientRef.current = client;
        await client.activate();
      } catch (error) {
        console.error("게임 소켓 초기화 실패:", error);
        isInitialized = false;
      }
    };

    const timer = setTimeout(() => {
      initializeClient();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (clientRef.current?.active) {
        console.log("게임 소켓 연결 정리 중...");
        clientRef.current.deactivate();
      }
      isInitialized = false;
    };
  }, [roomKey]);

  useEffect(() => {
    if (!isConnected || !clientRef.current || !roomKey || !currentPlayer) {
      console.log("구독 설정을 위한 조건이 충족되지 않음:", {
        isConnected,
        hasClient: !!clientRef.current,
        roomKey,
        currentPlayer,
      });
      return;
    }

    console.log("구독 설정 시작...", {
      playerNumber: currentPlayer.playerNumber,
      role: currentPlayer.role,
    });

    const subscriptions = [];

    try {
      // 1. 일반 채팅 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.chat.${roomKey}`,
          (message) => {
            const chatMessage = JSON.parse(message.body);
            console.log("채팅 메시지 수신:", chatMessage);
            setMessages((prev) => [...prev, chatMessage]);
          }
        )
      );

      // 2. 마피아 채팅 구독 (마피아인 경우만)
      if (currentPlayer.role === "MAFIA") {
        console.log("마피아 채팅 구독 설정");
        subscriptions.push(
          clientRef.current.subscribe(
            `/topic/game.chat.mafia.${roomKey}`,
            (message) => {
              const chatMessage = JSON.parse(message.body);
              console.log("마피아 채팅 수신:", chatMessage);
              setMessages((prev) => [
                ...prev,
                { ...chatMessage, isMafiaChat: true },
              ]);
            }
          )
        );
      }

      // 3. 게임 상태 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.state.${roomKey}`,
          (message) => {
            const response = JSON.parse(message.body);
            console.log("게임 상태 업데이트 수신:", response);

            if (response.gameStatus) {
              setGameStatus(response.gameStatus);
            }

            if (response.players) {
              console.log("새로운 플레이어 정보:", response.players);
              setPlayers(response.players);

              // 현재 플레이어 정보도 업데이트
              const updatedCurrentPlayer = response.players.find(
                (p) => p.playerNumber === currentPlayer?.playerNumber
              );
              if (updatedCurrentPlayer) {
                console.log(
                  "현재 플레이어 역할 업데이트:",
                  updatedCurrentPlayer
                );
                setCurrentPlayer(updatedCurrentPlayer);
              }
            }
          }
        )
      );

      // 4. 플레이어 상태 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.players.${roomKey}`,
          (message) => {
            const updatedPlayers = JSON.parse(message.body);
            console.log("플레이어 상태 업데이트:", updatedPlayers);
            setPlayers(updatedPlayers);

            // 현재 플레이어 정보도 업데이트
            const updatedCurrentPlayer = updatedPlayers.find(
              (p) => p.playerNumber === currentPlayer?.playerNumber
            );
            if (updatedCurrentPlayer) {
              console.log("현재 플레이어 상태 업데이트:", updatedCurrentPlayer);
              setCurrentPlayer(updatedCurrentPlayer);
            }
          }
        )
      );

      // 5. 마피아 타겟 구독
      if (currentPlayer?.role === "MAFIA") {
        subscriptions.push(
          clientRef.current.subscribe(
            `/topic/game.mafia.target.${roomKey}`,
            (message) => {
              const targetMessage = JSON.parse(message.body);
              setMafiaTarget(targetMessage.targetId);
            }
          )
        );
      }

      // 투표 현황 응답 형식

      // 6. 투표 상태 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.vote.${roomKey}`,
          (message) => {
            const voteData = JSON.parse(message.body);
            console.log("투표 상태 수신:", voteData); // 디버깅용

            if (voteData && voteData.voteStatus) {
              console.log("투표 상태 업데이트:", voteData.voteStatus);
              setVoteStatus(voteData.voteStatus);
            } else {
              console.log("직접 투표 상태 업데이트:", voteData);
              setVoteStatus(voteData);
            }
          }
        )
      );

      // 7. 투표 결과 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.vote.result.${roomKey}`,
          (message) => {
            const result = JSON.parse(message.body);
            console.log("투표 결과 수신:", result);

            if (result.success) {
              setPlayers((prevPlayers) =>
                prevPlayers.map((player) =>
                  player.playerNumber === result.targetPlayer?.playerNumber
                    ? { ...player, isVoteTarget: true }
                    : player
                )
              );
              setVoteStatus(result.finalVoteStatus);
            }
          }
        )
      );

      // 8. 찬반 투표 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.finalvote.${roomKey}`,
          (message) => {
            const voteData = JSON.parse(message.body);
            setFinalVotes(voteData);
          }
        )
      );

      // 9. 최종 투표 결과 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.finalvote.result.${roomKey}`,
          (message) => {
            const result = JSON.parse(message.body);
            if (result.gameStatus) {
              setGameStatus(result.gameStatus);
            }
            if (result.players) {
              setPlayers(result.players);
              updateCurrentPlayer(result.players);
            }
            if (result.message) {
              console.log("최종 투표 결과 메시지:", result.message);
            }
          }
        )
      );

      return () => {
        console.log("구독 정리 중...");
        subscriptions.forEach((sub) => sub?.unsubscribe());
      };
    } catch (error) {
      console.error("구독 설정 중 오류:", error);
    }
  }, [isConnected, roomKey, currentPlayer]);

  const sendGameMessage = useCallback(
    (message, isMafiaChat = false) => {
      if (!clientRef.current || !currentPlayer) {
        console.error(
          "메시지를 보낼 수 없습니다: 연결 또는 플레이어 정보 없음"
        );
        return;
      }

      if (
        currentPlayer.isAlive &&
        currentPlayer.role === "MAFIA" &&
        gameStatus === GAME_STATUS.NIGHT
      ) {
        isMafiaChat = true;
      } else {
        isMafiaChat = false;
      }
      console.log("메시지 전송 시도:", {
        message,
        isMafiaChat,
        currentPlayer,
        gameStatus,
      });

      const destination = isMafiaChat
        ? `/fromapp/game.chat.mafia/${roomKey}`
        : `/fromapp/game.chat/${roomKey}`;

      try {
        clientRef.current.publish({
          destination,
          body: JSON.stringify({
            username: currentPlayer.username,
            content: message,
            gameStatus: gameStatus,
            role: currentPlayer.role,
            roomKey: roomKey,
          }),
        });
      } catch (error) {
        console.error("메시지 전송 실패:", error);
      }
    },
    [roomKey, currentPlayer]
  );

  const setTarget = useCallback(
    (targetId) => {
      if (!clientRef.current || currentPlayer?.role !== "MAFIA") return;

      clientRef.current.publish({
        destination: `/fromapp/game.mafia.target/${roomKey}`,
        body: JSON.stringify({
          mafiaId: currentPlayer.playerNumber,
          targetId,
        }),
      });
    },
    [roomKey, currentPlayer]
  );

  const sendVote = useCallback(
    (targetId) => {
      if (!clientRef.current || !currentPlayer) return;

      clientRef.current.publish({
        destination: `/fromapp/game.vote/${roomKey}`,
        body: JSON.stringify({
          voterId: currentPlayer.playerNumber,
          targetId,
        }),
      });
    },
    [roomKey, currentPlayer]
  );

  const processVoteResult = useCallback(async () => {
    if (!isHost) {
      throw new Error("방장만 투표 결과를 처리할 수 있습니다.");
    }

    try {
      clientRef.current?.publish({
        destination: `/fromapp/game.vote.result/${roomKey}`,
        body: JSON.stringify({ voteStatus }),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [roomKey, isHost, voteStatus]);

  const sendFinalVote = useCallback(
    async (isAgree) => {
      try {
        await axios.post(
          `${API_BASE_URL}/game/finalvote/${roomKey}`,
          {
            roomKey: parseInt(roomKey),
            playerNumber: currentPlayer.playerNumber,
            isAgree,
          },
          { withCredentials: true }
        );
      } catch (error) {
        throw error;
      }
    },
    [roomKey, currentPlayer]
  );

  const requestFinalVoteResult = useCallback(() => {
    if (!isHost || !clientRef.current) {
      throw new Error("방장만 최종 투표 결과를 요청할 수 있습니다.");
    }

    try {
      clientRef.current.publish({
        destination: `/fromapp/game.finalvote.result/${roomKey}`,
      });
    } catch (error) {
      throw error;
    }
  }, [roomKey, isHost]);

  const updateGameStatus = useCallback(
    async (newStatus) => {
      if (!isHost || !clientRef.current) {
        throw new Error("방장만 게임 상태를 변경할 수 있습니다.");
      }

      try {
        clientRef.current.publish({
          destination: `/fromapp/game.state.update/${roomKey}`,
          body: JSON.stringify({ gameStatus: newStatus }),
        });
      } catch (error) {
        throw error;
      }
    },
    [roomKey, isHost]
  );

  const canChat = useCallback(() => {
    console.log("채팅 가능 여부 체크:", {
      currentPlayer,
      gameStatus,
      isAlive: currentPlayer?.isAlive,
      role: currentPlayer?.role,
    });

    if (!currentPlayer) return false;

    // 낮에는 모든 살아있는 플레이어가 채팅 가능
    if (gameStatus === GAME_STATUS.DAY) {
      return currentPlayer.isAlive;
    }

    // 밤에는 마피아만 채팅 가능
    if (gameStatus === GAME_STATUS.NIGHT) {
      return currentPlayer.isAlive && currentPlayer.role === "MAFIA";
    }

    // 투표 시간에는 모든 살아있는 플레이어가 채팅 가능
    if (
      gameStatus === GAME_STATUS.VOTE ||
      gameStatus === GAME_STATUS.FINALVOTE
    ) {
      return currentPlayer.isAlive;
    }

    return false;
  }, [currentPlayer, gameStatus]);

  const canVote = useCallback(() => {
    return currentPlayer?.isAlive && gameStatus === GAME_STATUS.VOTE;
  }, [currentPlayer, gameStatus]);

  const canFinalVote = useCallback(() => {
    if (!currentPlayer?.isAlive || gameStatus !== GAME_STATUS.FINALVOTE) {
      return false;
    }
    return !currentPlayer.isVoteTarget;
  }, [currentPlayer, gameStatus]);

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
    sendGameMessage,
    setTarget,
    sendVote,
    processVoteResult,
    sendFinalVote,
    requestFinalVoteResult,
    updateGameStatus,
    canChat,
    canVote,
    canFinalVote,
  };

  return (
    <GameSocketContext.Provider value={value}>
      {children}
    </GameSocketContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameSocketContext);
  if (!context) {
    throw new Error("GameSocketProvider 내부에서만 사용할 수 있습니다");
  }
  return context;
};
