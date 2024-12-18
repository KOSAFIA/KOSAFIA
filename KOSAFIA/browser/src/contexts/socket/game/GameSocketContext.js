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
import { GAME_STATUS, STATUS_DURATION } from "../../../constants/GameStatus";
import axios from "axios";
import { useRouteLoaderData } from "react-router-dom";

const WEBSOCKET_URL = "http://localhost:8080/wstomp";
const API_BASE_URL = "http://localhost:8080/api";

export const GameSocketContext = createContext();

export const GameSocketProvider = ({ roomKey, children }) => {
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [gameStatus, setGameStatus] = useState();
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [mafiaTarget, setMafiaTarget] = useState(null);
  const [voteStatus, setVoteStatus] = useState({});
  const [mostVotedPlayer, setMostVotedPlayer] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [currentImage, setCurrentImage] = useState(null); // 현재 표시 중인 이미지
  const [queue, setQueue] = useState([]); // 이미지 표시 대기열
  const [finalVotes, setFinalVotes] = useState({
    agree: 0,
    disagree: 0,
  });
  const [gameTime, setGameTime] = useState(
    STATUS_DURATION[GAME_STATUS.FOURTH_DELAY]
  );
  const [dayCount, setDayCount] = useState(1);
  const clientRef = useRef(null);

  //gameStatus가 변경될때마다 gameTime 을 새롭게 설정함.
  useEffect(() => {
    if (gameStatus) {
      setGameTime(STATUS_DURATION[gameStatus] || 0);
    }
  }, [gameStatus]);

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

  useEffect(() => {
    if (!isConnected || !clientRef.current || !roomKey) return;

    const gameStateSubscription = clientRef.current.subscribe(
      `/topic/game.state.${roomKey}`,
      (message) => {
        const data = JSON.parse(message.body);
        console.log("이미지 상태 메시지 수신:", data);

        const { stageImageUrl, interactionImageUrl, endingImageUrl } = data;

        if (endingImageUrl) {
          console.log("엔딩 이미지 설정:", endingImageUrl);
          setQueue([{ type: "ending", imageUrl: endingImageUrl }]);
          setCurrentImage(endingImageUrl);
        } else {
          setQueue((prevQueue) => [
            ...prevQueue,
            ...(stageImageUrl ? [{ type: "stage", imageUrl: stageImageUrl }] : []),
            ...(interactionImageUrl ? [{ type: "interaction", imageUrl: interactionImageUrl }] : []),
          ]);
        }
      }
    );

    return () => gameStateSubscription.unsubscribe();
  }, [isConnected, roomKey]);

  useEffect(() => {
    if (currentImage || queue.length === 0) return; // 현재 이미지가 표시 중이면 대기

    const nextImage = queue[0];
    setCurrentImage(nextImage.imageUrl);

    const displayTime = nextImage.type === "stage" ? 2000 : 3000; // 스테이지는 2초, 인터랙션은 3초

    const timer = setTimeout(() => {
      setQueue((prevQueue) => prevQueue.slice(1)); // 큐에서 다음 이미지로 이동
      setCurrentImage(null); // 현재 이미지 해제
    }, displayTime);

    return () => clearTimeout(timer);
  }, [currentImage, queue]);

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
        } else if (sound === "gun") {
          new Audio("/sound/gun.mp3").play();
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
      // 1. 타이머 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.timer.${roomKey}`,
          (message) => {
            const response = JSON.parse(message.body);
            if (response.success) {
              setGameTime(response.time);
            } else {
              console.error("타이머 업데이트 실패:", response.message);
            }
          }
        )
      );

      // 2. 일반 채팅 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.chat.${roomKey}`,
          (socketMsg) => {
            const chatMessage = JSON.parse(socketMsg.body);
            console.log("채팅 메시지 수신:", chatMessage);
            setMessages((prev) => [...prev, chatMessage]);
          }
        )
      );

      // 3. 마피아 채팅 구독 (마피아인 경우만)
      if (currentPlayer.role === "MAFIA") {
        console.log("마피아 채팅 구독 설정");
        subscriptions.push(
          clientRef.current.subscribe(
            `/topic/game.chat.mafia.${roomKey}`,
            (socketMsg) => {
              const chatMessage = JSON.parse(socketMsg.body);
              console.log("마피아 채팅 수신:", chatMessage);
              setMessages((prev) => [
                ...prev,
                { ...chatMessage, isMafiaChat: true },
              ]);
            }
          )
        );
      }

      //하은님꺼 여기에 추가
      // 4. 게임 상태 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.state.${roomKey}`,
          (socketMsg) => {
            const {gameStatus, players, currentTime, turn: dayCount, success, message: systemMessage} = JSON.parse(socketMsg.body);
            if (success) {setGameStatus(gameStatus);setPlayers(players);setGameTime(currentTime);setDayCount(dayCount);
              // 시스템 메시지가 있다면 추가
              if (systemMessage) {
                setMessages((prev) => [
                  ...prev,
                  {
                    text: systemMessage,
                    isSystemMessage: true,
                  },
                ]);
              }
            }
          }
        )
      );

      // 5. 플레이어 상태 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.players.${roomKey}`,
          (socketMsg) => {
            const updatedPlayers = JSON.parse(socketMsg.body);
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

      // 6. 마피아 타겟 구독
      if (currentPlayer?.role === "MAFIA") {
        subscriptions.push(
          clientRef.current.subscribe(
            `/topic/game.mafia.target.${roomKey}`,
            (socketMsg) => {
              const targetMessage = JSON.parse(socketMsg.body);
              setMafiaTarget(targetMessage.targetId);
            }
          )
        );
      }

      // 투표 현황 응답 형식

      // 7. 투표 상태 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.vote.${roomKey}`,
          (socketMsg) => {
            const voteData = JSON.parse(socketMsg.body);
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

      // 8. 투표 결과 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.vote.result.${roomKey}`,
          (socketMsg) => {
            const result = JSON.parse(socketMsg.body);
            console.log("투표 결과 수신:", result);
            if (result.success) {
              setPlayers((prevPlayers) =>
                prevPlayers.map((player) =>
                  player.playerNumber === result.targetPlayer?.playerNumber
                    ? { ...player, isVoteTarget: true }
                    : { ...player, isVoteTarget: false }
                )
              );
              setVoteStatus(result.voteResult);
              setMostVotedPlayer(result.targetPlayer);
              //여까지 된거에서 투표 결과에따라 상태 전환 로직이 다르게 돌아가야겠네. 일단 보트 스테이터스는 게임룸으로 넘어가니까
            }
          }
        )
      );

      // 9. 찬반 투표 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.finalvote.${roomKey}`,
          (socketMsg) => {
            const voteData = JSON.parse(socketMsg.body);
            setFinalVotes(voteData);
          }
        )
      );

      // 10. 최종 투표 결과 구독
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.finalvote.result.${roomKey}`,
          (socketMsg) => {
            const result = JSON.parse(socketMsg.body);
            console.log("최종 투표 결과 수신:", result);

            // 플레이어 정보 업데이트
            if (result.players) {
              setPlayers(result.players);
              updateCurrentPlayer(result.players);
            }

            // 시스템 메시지 추가
            if (result.message) {
              const systemMessage = {
                username: "SYSTEM",
                content: result.message,
                gameStatus: result.gameStatus,
                roomKey: roomKey,
                playerNumber: 0,
                isSystemMessage: true,
              };
              setMessages((prev) => [...prev, systemMessage]);
            }

            // // 이미지 URL 업데이트
            // if (result.imageUrl) {
            //   setImageUrl(result.imageUrl);
            // }
          }
        )
      );

      // 시스템 메시지 구독 -> 채팅창에 등록해야겠지
      subscriptions.push(
        clientRef.current.subscribe(
          `/topic/game.system.${roomKey}`,
          (message) => {
            console.log("시스템 메시지 수신:", message.body);
            const systemMessage = JSON.parse(message.body);
            // 중복 메시지 체크
            if (
              !messages.some(
                (msg) =>
                  msg.content === systemMessage.content &&
                  msg.timestamp === systemMessage.timestamp
              )
            ) {
              setMessages((prev) => [...prev, systemMessage]);
            }
          }
        )
      );
      //경찰만 받는 비밀 시스템 메시지 구독.
      if (currentPlayer.role === "POLICE") {
        subscriptions.push(
          clientRef.current.subscribe(
            `/topic/game.police.${roomKey}`,
            (socketMsg) => {
              const policeMsg = JSON.parse(socketMsg.body);
              setMessages((prev) => [
                ...prev,
                {
                  ...policeMsg,
                  isSystemMessage: false,
                },
              ]);
            }
          )
        );
      }

      return () => {
        console.log("구독 정리 중...");
        subscriptions.forEach((sub) => sub?.unsubscribe());
      };
    } catch (error) {
      console.error("구독 설정 중 오류:", error);
    }
  }, [isConnected, roomKey]);

  const sendGameMessage = useCallback(
    (message, isMafiaChat = false) => {
      if (!clientRef.current || !currentPlayer) {
        console.error(
          "메시지를 보낼 수 없습니다: 연결 또는 플레이어 정보 없음"
        );
        return;
      }

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
            playerNumber: currentPlayer.playerNumber,
            isSystemMessage: false,
          }),
        });
      } catch (error) {
        console.error("메시지 전송 실패:", error);
      }
    },
    [roomKey, currentPlayer, gameStatus]
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
    console.log("투표 결과 처리 시작", { isHost, roomKey, voteStatus });

    if (!isHost) {
      console.error("방장 권한 없음");
      throw new Error("방��만 투표 결과를 처리할 수 있습니다.");
    }

    try {
      console.log("투표 결과 전송 시도", {
        destination: `/fromapp/game.vote.result/${roomKey}`,
        voteStatus,
      });

      clientRef.current?.publish({
        destination: `/fromapp/game.vote.result/${roomKey}`,
        body: JSON.stringify({ voteStatus }),
      });

      console.log("투표 결과 전송 성공");
      return { success: true };
    } catch (error) {
      console.error("투표 결과 처리 중 오류:", error);
      return { success: false, error };
    }
  }, [roomKey, isHost, voteStatus]);

  const sendFinalVote = useCallback(
    async (isAgree) => {
      try {
        console.log("최종 투표 요청:", {
          isAgree,
          playerNumber: currentPlayer?.playerNumber,
        });
        const response = await axios.post(
          `${API_BASE_URL}/game/finalvote/${roomKey}`,
          {
            roomKey: roomKey,
            playerNumber: currentPlayer?.playerNumber,
            isAgree: isAgree,
          }
        );

        if (response.data) {
          console.log("최종 투표 성공:", response.data);
          // 투표 상태 업데이트를 위한 소켓 구독은 유지
        }
      } catch (error) {
        console.error("최종 투표 실패:", error);
        throw error;
      }
    },
    [roomKey, currentPlayer]
  );

  const processFinalVoteResult = useCallback(() => {
    console.log("최종 투표 결과 처리 시작", {
      isHost,
      roomKey,
      currentPlayer: currentPlayer?.playerNumber,
    });

    if (!isHost || !clientRef.current) {
      console.log("방장 권한 없음, 처리 중단");
      return; // throw 대신 조용히 리턴
    }

    try {
      console.log("최종 투표 결과 요청 전송");
      clientRef.current.publish({
        destination: `/fromapp/game.finalvote.result/${roomKey}`,
        body: JSON.stringify({
          roomKey: roomKey,
          playerNumber: currentPlayer?.playerNumber,
        }),
      });
      setVoteStatus({});
      console.log("최종 투표 결과 요청 완료");
    } catch (error) {
      console.error("최종 투표 결과 처리 중 오류:", error);
    }
  }, [roomKey, isHost, currentPlayer]);

  const updateGameStatus = useCallback(
    (newStatus) => {
      if (!clientRef.current || !currentPlayer || !isHost) {
        console.error(
          "게임 상태를 변경할 수 없습니다: 권한이 없거나 연결되지 않음"
        );
        return;
      }

      try {
        clientRef.current.publish({
          destination: `/fromapp/game.state.update/${roomKey}`,
          body: JSON.stringify({
            gameStatus: newStatus,
            player: currentPlayer,
          }),
        });
      } catch (error) {
        console.error("게임 상태 업데이트 실패:", error);
      }
    },
    [roomKey, currentPlayer, isHost]
  );

  const canChat = useCallback(() => {
    if (!currentPlayer || !currentPlayer.isAlive) return false;
    // 밤에는 마피아만 채팅 가능
    else if (gameStatus === GAME_STATUS.NIGHT)
      return currentPlayer.role === "MAFIA";
    // 낮에는 모든 살아있는 플레이어가 채팅 가능
    else if (gameStatus === GAME_STATUS.DAY || gameStatus === GAME_STATUS.VOTE)
      return true;
    // 투표 시간에는 모든 살아있는 플레이어가 채팅 가능
    else if (gameStatus === GAME_STATUS.FINALVOTE)
      return currentPlayer.isVoteTarget;
    else return false;
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

  const sendSystemMessage = useCallback(
    (text) => {
      if (clientRef.current) {
        clientRef.current.publish({
          destination: `/fromapp/game.system.${roomKey}`,
          body: JSON.stringify({
            username: "System",
            content: text,
            gameStatus: gameStatus,
            // role: 'SYSTEM',
            roomKey: roomKey,
            playerNumber: 0,
            isSystemMessage: true,
          }),
        });
      }
    },
    [roomKey, gameStatus]
  );

  // 시간 조절 함수
  const modifyGameTime = useCallback(
    (adjustment) => {
      if (clientRef.current && currentPlayer) {
        clientRef.current.publish({
          destination: `/fromapp/game.timer.modify/${roomKey}`,
          body: JSON.stringify({
            playerNumber: currentPlayer.playerNumber,
            adjustment: adjustment,
          }),
        });
      }
    },
    [roomKey, currentPlayer]
  );

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
    processFinalVoteResult,
    updateGameStatus,
    canChat,
    canVote,
    canFinalVote,
    gameTime,
    dayCount,
    sendSystemMessage,
    modifyGameTime,
    currentImage,
    mostVotedPlayer,
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