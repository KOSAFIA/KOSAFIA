import React, { useState, useRef, useEffect, useCallback } from "react";
import PlayerCard from "../components/PlayerCard";
import Timer from "../components/Timer";
import DayIndicator from "../components/DayIndicator";
import ChatBox from "../components/ChatBox";
import Popup from "../components/JobExpectationPopUp";
import JobInfoIcon from "../components/JobInfoIcon";
import handleTargetsUpdate from "../hooks/game/HandleTargetsUpdate";
import handleNightActions from "../hooks/game/HandleNightAction";
import ResultPopup from "../components/ResultPopup";
import { useGameContext } from "../contexts/socket/game/GameSocketContext";
import FirstJobExplainpopUp from "../components/FirstJobExplainPopup";

import {
  GAME_STATUS,
  NEXT_STATUS,
  STATUS_INDEX,
  GAME_PHASES,
} from "../constants/GameStatus";
import "../styles/GameRoom.css";

const GameRoom = () => {
  const [showFirstJobExplainPopup, setFirstJobExplainPopup] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [targetSelection, setTargetSelection] = useState({}); // 각 플레이어가 선택한 타겟을 저장
  const chatBoxRef = useRef();

  // GameSocketContext에서 필요한 상태들을 가져옴
  const {
    roomKey, //현재 방 키값 INTIGER
    players, //현재 방에 있는 플레이어들 ArrayList<Player>
    messages,
    gameStatus, //서버 게임 진행상태 동기화. 변수값의 정체:GAME_STATUS = {NONE: 'NONE',DAY: 'DAY',NIGHT: 'NIGHT',VOTE: 'VOTE',INALVOTE: 'FINALVOTE',DELAY: 'DELAY'};
    currentPlayer, //현재 플레이어 정보 Player.java 와 동일
    mafiaTarget, //마피아가 누굴 찍고 있는지 동기화 하는 변수
    setTarget, //투표할때 누굴 찍었는지 동기화 하는 변수
    canVote, //투표 가능 여부
    sendVote, //투표 전송 소켓 함수
    sendGameMessage, //게임 메시지 전송 소켓 함수
    canChat, //채팅 가능 여부
    isHost, // 방장 여부 추가
    updateGameStatus, // 게임 상태 업데이트 함수 추가
    gameTime, // 서버에서 받은 시간
    dayCount, // 현재 일차
    sendSystemMessage, // 시스템 메시지 전송 함수
    modifyGameTime,
    processVoteResult,
    processFinalVoteResult,
    sendFinalVote,
    canFinalVote,
    voteStatus,
    finalVotes,
    currentImage,
    mostVotedPlayer,
  } = useGameContext();

  // 시간 조절한 플레이어 목록 관리 (새로운 게임 시작 시 초기화 필요)
  const [timeModifiedPlayers, setTimeModifiedPlayers] = useState(new Set());

  // 게임 상태가 변경될 때 timeModifiedPlayers 초기화
  useEffect(() => {
    if (gameStatus === GAME_STATUS.NIGHT) {
      setTimeModifiedPlayers(new Set());
    }
  }, [gameStatus]);

  // 엔딩용 팝업 로직
  useEffect(() => {
    if (currentImage ) {
      setShowResultPopup(true);

      const timer = setTimeout(() => {
        setShowResultPopup(false);
      }, 5000); // 5초 후 팝업 숨기기

      return () => clearTimeout(timer);
    }
  }, [currentImage ]);

  useEffect(() => {
    // gameStatus가 NIGHT일 때만 handleStageChange 실행
    if (gameStatus === GAME_STATUS.FIRST_DELAY) {
      const handleNightPhase = async () => {
        // 먼저 타겟 정보를 처리
        let targetPlayerNumber = targetSelection[currentPlayer.playerNumber];

        if (targetPlayerNumber !== undefined && currentPlayer.isAlive) {
          await handleTargetsUpdate(
            currentPlayer.playerNumber,
            targetPlayerNumber
          );
        }

        // 그 후, 밤 동안의 직업별 행동을 처리
        if (isHost) {
          await handleNightActions(1);
        }

        // 마지막으로, 게임 상태를 업데이트
        if (isHost) {
          updateGameStatus(NEXT_STATUS[gameStatus]);
        }

        //작업이 끝난 뒤 초기화
        targetPlayerNumber = null;
        console.log(
          currentPlayer.playerNumber +
            "의 targetPlayerNumber 초기화 확인 여부 : " +
            targetPlayerNumber
        );
      };

      handleNightPhase(); // 비동기 작업을 제대로 처리할 수 있도록 함수 내부에서 호출
    }
  }, [gameStatus, targetSelection, currentPlayer, isHost, updateGameStatus]);

  // 처음 직업설명 팝업창 열기
  const handleOpenFirstJobExplainPopup = () => {
    setFirstJobExplainPopup(true);
  };

  // 처음 직업설명 팝업창 닫기
  const handleCloseFirstJobExplainPopup = () => {
    setFirstJobExplainPopup(false);
  };

  const sendMessageToChat = (message) => {
    chatBoxRef.current?.receiveMessage(message);
  };

  const handleOpenPopup = (playerName) => {
    setSelectedPlayer(playerName);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedPlayer(null);
  };

  // 타겟 변경을 처리하는 함수
  const handleTargetChange = (currentPlayerNum, targetPlayerNumber) => {
    console.log("handleTargetChange 함수 실행");

    //타겟을 상태에 저장.
    setTargetSelection((prev) => ({
      ...prev,
      [currentPlayerNum]: targetPlayerNumber,
    }));
    // 타겟 정보는 밤 단계가 끝난 후 한 번에 서버로 전송하므로 상태만 저장함.
  };

  // 플레이어 선택 핸들러 수정
  const handlePlayerSelect = (targetId) => {
    if (gameStatus === GAME_STATUS.NIGHT && currentPlayer?.role === "MAFIA") {
      setTarget(targetId);
    }
    // else if (gameStatus === GAME_STATUS.VOTE && canVote()) {
    //   sendVote(targetId);
    // }
    const player = players.find((p) => p.playerNumber === targetId);
    if (player) {
      const playerName = `Player ${player.playerNumber} (${player.role})`;

      // 같은 카드를 클릭하면 선택 상태를 해제
      if (selectedPlayer === playerName) {
        handleOpenPopup(null);
      } else {
        handleOpenPopup(playerName); // 카드 클릭시 선택 상태로 변경
      }
    }
  };

  // 시간 조절 가능 여부 체크
  const canModifyTime = useCallback(() => {
    return (
      gameStatus === GAME_STATUS.DAY &&
      currentPlayer?.isAlive &&
      !timeModifiedPlayers.has(currentPlayer?.playerNumber)
    );
  }, [gameStatus, currentPlayer, timeModifiedPlayers]);

  const sendGameSystemMessage = useCallback(
    (message) => {
      sendSystemMessage(message);
      sendMessageToChat({
        text: message,
        isSystemMessage: true,
      });
    },
    [sendSystemMessage]
  );

  // 게임 상태 변경 시 시스템 메시지 전송
  useEffect(() => {
    if (gameStatus && isHost) {
      let message = null;
      switch(gameStatus) {
        case GAME_STATUS.DAY:
          message = `${gameStatus} 시간이 시작되었습니다.`;
          break;
        case GAME_STATUS.NIGHT:
          message = `${gameStatus} 시간이 시작되었습니다.`;
          break;
        case GAME_STATUS.VOTE:
          message = `${gameStatus} 시간이 시작되었습니다.`;
          break;
        case GAME_STATUS.FINALVOTE:
          message = `${gameStatus} 시간이 시작되었습니다.`;
          break;
        default:
          message = null;
          break;
      }
      if (message) {
        sendGameSystemMessage(message);
      }
    }
  }, [gameStatus]);

  // 시간 조절 핸들러 수정
  const handleModifyTime = useCallback(async (adjustment) => {
    if (canModifyTime()) {
      try {
        await modifyGameTime(adjustment);  // 타이머 수정 완료 대기
        setTimeModifiedPlayers((prev) => 
          new Set([...prev, currentPlayer.playerNumber])
        );
        // 서버에서 시스템 메시지 처리하도록 변경
      } catch (error) {
        console.error("타이머 수정 실패:", error);
      }
    }
  }, [canModifyTime, modifyGameTime, currentPlayer]);

  // 컴포넌트 최상단에 추가
  const isProcessingTimer = useRef(false);

  // handleTimerEnd 수정
  const handleTimerEnd = useCallback(async () => {
    if (!isHost) return;  // 방장만 처리
    
    if (isProcessingTimer.current) {
        console.log("이미 타이머 종료 처리 중");
        return;
    }
    
    const currentStatus = gameStatus;
    let nextStatus = NEXT_STATUS[currentStatus];

    try {
        isProcessingTimer.current = true;
        console.log("방장이 타이머 종료 처리 시작");
        
        if (gameStatus === "FINALVOTE") {
            await processFinalVoteResult();
        }
        else if(currentStatus === GAME_STATUS.VOTE) {
            await processVoteResult();
        }
        else if(currentStatus === GAME_STATUS.FOURTH_DELAY) {
            setMyVoteTarget(null);
        }
        else if(currentStatus === GAME_STATUS.THIRD_DELAY) {
            nextStatus = mostVotedPlayer != null ? 
                NEXT_STATUS[currentStatus] :  
                GAME_STATUS.FOURTH_DELAY;  
        }
        
        if(nextStatus === null) {
            nextStatus = NEXT_STATUS[currentStatus];
        }

        // 방장만 시스템 메시지와 상태 업데이트를 전송
        // sendGameSystemMessage(`${currentStatus} 시간이 종료되었습니다.`);
        await updateGameStatus(nextStatus);
        
        console.log("방장의 타이머 종료 처리 완료", {
            currentStatus,
            nextStatus
        });
    } catch (error) {
        console.error("타이머 종료 처리 중 오류:", error);
    } finally {
        isProcessingTimer.current = false;  // 처리 완료 후 플래그 초기화
    }
  }, [isHost, gameStatus, processVoteResult, processFinalVoteResult, updateGameStatus, sendGameSystemMessage, mostVotedPlayer]);

  // // 다음 페이즈로 넘어가는 핸들러 추가
  // const handleNextPhase = useCallback(async () => {
  //   if (gameStatus === GAME_STATUS.NIGHT) {
  //     const targetPlayerNumber = targetSelection[currentPlayer.playerNumber];

  //     // 1. 먼저 타겟 정보 전송
  //     if (targetPlayerNumber !== undefined) {
  //       await handleTargetsUpdate(
  //         currentPlayer.playerNumber,
  //         targetPlayerNumber
  //       );
  //     }
  //     // 2. 밤 액션 처리
  //     await handleNightActions(1);
  //   } else if (gameStatus === GAME_STATUS.DAY) {
  //     // await handleDayActions(1);
  //   } else if (gameStatus === GAME_STATUS.VOTE) {
  //     if (isHost) {
  //       processVoteResult();
  //     }
  //   } else if (gameStatus === GAME_STATUS.FINALVOTE) {
  //     if (isHost) {
  //       processFinalVoteResult();
  //     }
  //   } else if (gameStatus === GAME_STATUS.FIRSTDELAY) {
  //   } else if (gameStatus === GAME_STATUS.SECONDDELAY) {
  //   } else if (gameStatus === GAME_STATUS.THIRDDELAY) {
  //   } else if (gameStatus === GAME_STATUS.FOURTHDELAY) {
  //   }

  //   if (isHost) {
  //     sendGameSystemMessage(`${gameStatus} 단계가 종료되었습니다.`);
  //     // 다음 상태로 업데이트
  //     updateGameStatus(NEXT_STATUS[gameStatus]);
  //   }
  // }, [isHost, gameStatus, updateGameStatus, sendGameSystemMessage]);

  // messages 상태 디버깅을 위한 useEffect 추가
  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

  // currentPlayer 상태 디버깅을 위한 useEffect 추가
  useEffect(() => {
    console.log("Current player updated:", currentPlayer);
  }, [currentPlayer]);

  
  const [myVoteTarget, setMyVoteTarget] = useState(null);  // 내가 투표한 플레이어 번호
  const [myFinalVote, setMyFinalVote] = useState(null);  // null, true(찬성), false(반대)

  // 투표 처리 함수
  const handleVote = (targetPlayerNum) => {
    setMyVoteTarget(targetPlayerNum);
    sendVote(targetPlayerNum);
  };

  // PlayerCard에 전달할 핸들러
  const handleFinalVote = async (isAgree) => {
    try {
        // 먼저 서버에 전송
        await sendFinalVote(isAgree);
        // 성공하면 상태 업데이트
        setMyFinalVote(isAgree === myFinalVote ? null : isAgree);
    } catch (error) {
        console.error("최종 투표 처리 실패:", error);
    }
  };

  return (
    <div
      className={`game-room ${
        gameStatus === GAME_STATUS.FIRST_DELAY ? "shadow-inset-top" : ""
      }`}
    >
      {/* 게임 시작시 직업 소개 팝업창 */}
      {currentPlayer && showFirstJobExplainPopup && (
        <FirstJobExplainpopUp
          currentPlayerRole={currentPlayer.role}
          onClose={handleCloseFirstJobExplainPopup}
        />
      )}
      <div className="chat-area">
        <div className="player-area">
          <div className="header">
            {/* 타이머 */}
            {players.length > 0 && currentPlayer && (
              <Timer
                time={gameTime}
                gameStatus={gameStatus}
                dayCount={dayCount}
                onTimerEnd={handleTimerEnd}
                onModifyTime={handleModifyTime}
                canModifyTime={canModifyTime()}
                currentPlayerIsAlive={currentPlayer.isAlive}
                isHost={isHost}
              />
            )}
            <DayIndicator
              currentPhase={gameStatus === GAME_STATUS.NIGHT ? "NIGHT" : "DAY"}
            />
          </div>
          {/* 직업 소개 아이콘 */}
          {currentPlayer && <JobInfoIcon role={currentPlayer.role} />}
          {/* 플레이어 카드 */}
          <div className="player-cards">
            {players.length > 0 ? (
              players.map((player, index) => (
                <PlayerCard
                  key={index}
                  name={`Player ${player.username}`}
                  index={player.playerNumber - 1}
                  role={player.role}
                  isNight={gameStatus === GAME_STATUS.NIGHT}
                  currentPlayerRole={currentPlayer.role}
                  currentPlayerNum={currentPlayer.playerNumber}
                  currentPlayer={currentPlayer}
                  onTargetChange={handleTargetChange}
                  isAlive={player.isAlive}
                  gameStatus={gameStatus}
                  voteCount={voteStatus[player.playerNumber] || 0}
                  isVoteTarget={player.isVoteTarget}
                  canFinalVote={canFinalVote()}
                  voteStatus={voteStatus}
                  myVoteTarget={myVoteTarget}
                  onClick={() => {
                    if (!currentPlayer.isAlive) {
                      return;
                    }
                    // 투표 단계에서는 팝업을 열지 않고 투표만 처리
                    if (gameStatus === GAME_STATUS.VOTE && canVote()) {
                      handleVote(player.playerNumber);
                      return; // 투표 후 함수 종료
                    } else if (
                      gameStatus === GAME_STATUS.FINALVOTE &&
                      canFinalVote() &&
                      player.isVoteTarget
                    ) {
                      return;
                    } else {
                      handlePlayerSelect(player.playerNumber);
                    }
                  }}
                  onFinalVoteClick={handleFinalVote}
                  finalVotes={{
                    myVote: finalVotes[currentPlayer.playerNumber],
                  }}
                  selectedPlayer={selectedPlayer}
                  setSelectedPlayer={setSelectedPlayer}
                  myFinalVote={myFinalVote}
                />
              ))
            ) : (
              <div>플레이어 정보를 불러오는 중...</div>
            )}
          </div>
        </div>
        {/* 채팅박스 */}
        <ChatBox
          ref={chatBoxRef}
          gameStatus={gameStatus}
          messages={messages || []}
          canChat={canChat() || false}
          onSendMessage={sendGameMessage}
          currentPlayer={currentPlayer || null}
        />
      </div>
      {isPopupOpen && (
        <Popup onClose={handleClosePopup} selectedPlayer={selectedPlayer} />
      )}

      <>{currentImage && <ResultPopup imageUrl={currentImage} />}</>
    </div>
  );
};

export default GameRoom;
