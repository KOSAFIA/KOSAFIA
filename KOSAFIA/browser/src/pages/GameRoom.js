import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import PlayerCard from "../components/PlayerCard";
import Timer from "../components/Timer";
import DayIndicator from "../components/DayIndicator";
import ChatBox from "../components/ChatBox";
import Popup from "../components/JobExpectationPopUp";
import JobInfoIcon from "../components/JobInfoIcon";
import handleTargetsUpdate from "../hooks/game/HandleTargetsUpdate";
import handleNightActions from "../hooks/game/HandleNightAction";
import { useGameContext } from "../contexts/socket/game/GameSocketContext";
import FirstJobExplainpopUp from "../components/FirstJobExplainPopup";

import {
  GAME_STATUS,
  NEXT_STATUS,
  STATUS_INDEX,
} from "../constants/GameStatus";
import "../styles/GameRoom.css";

// 상단에 stages 상수 추가
const stages = [
  { name: "NIGHT", image: "/img/night.png" },
  { name: "DELAY", image: "/img/day.png" },
  { name: "DAY", image: "/img/day.png" },
  { name: "VOTE", image: "/img/vote.png" },
  { name: "FINALVOTE", image: "/img/discussion.png" },
];

const GameRoom = () => {
  // 1. 모든 state 선언
  const [showFirstJobExplainPopup, setFirstJobExplainPopup] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [targetSelection, setTargetSelection] = useState({});
  const [timeModifiedPlayers, setTimeModifiedPlayers] = useState(new Set());
  const chatBoxRef = useRef();
  const [previousGameStatus, setPreviousGameStatus] = useState(null);

  // 2. Context에서 값 가져오기
  const { 
    roomKey, //현재 방 키값 INTIGER
    players, //현재 방에 있는 플레이어들 ArrayList<Player>
    messages,
    gameStatus,//서버 게임 진행상태 동기화. 변수값의 정체:GAME_STATUS = {NONE: 'NONE',DAY: 'DAY',NIGHT: 'NIGHT',VOTE: 'VOTE',INALVOTE: 'FINALVOTE',DELAY: 'DELAY'};
    currentPlayer, //현재 플레이어 정보 Player.java 와 동일
    mafiaTarget, //마피아가 누굴 찍고 있는지 동기화 하는 변수
    setTarget, //투표할때 누굴 찍었는지 동기화 하는 변수
    canVote, //투표 가능 여부
    sendVote, //투표 전송 소켓 함수
    sendGameMessage, //게임 메시지 전송 소켓 함수
    canChat, //채팅 가능 여부
    isHost, // 방장 여부 추가
    updateGameStatus, // 게임 상태 업데이트 함수 추가
    gameTime,         // 서버에서 받은 시간
    dayCount,         // 현재 일차
    sendSystemMessage, // 시스템 메시지 전송 함수
    modifyGameTime,
    voteStatus, // 투표 현황 추가
    processVoteResult, // 투표 결과 처리 함수 추가
    startGame,
    processNightResult,    // context에서 가져오기   // context에서 가져오기
    processFinalVoteResult // context에서 가져오기
  } = useGameContext();

  // 3. 모든 useCallback, useEffect 선언을 여기에 배치
  const sendMessageToChat = useCallback((message) => {
    chatBoxRef.current?.receiveMessage(message);
  }, []);

  const sendGameSystemMessage = useCallback((message) => {
    sendSystemMessage(message);
    sendMessageToChat({
      text: message,
      isSystemMessage: true
    });
  }, [sendSystemMessage, sendMessageToChat]);

  const handleOpenFirstJobExplainPopup = useCallback(() => {
    setFirstJobExplainPopup(true);
  }, []);

  const handleCloseFirstJobExplainPopup = useCallback(() => {
    setFirstJobExplainPopup(false);
  }, []);

  const handleOpenPopup = useCallback((playerName) => {
    setSelectedPlayer(playerName);
    setIsPopupOpen(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setIsPopupOpen(false);
    setSelectedPlayer(null);
  }, []);

  const handleTargetChange = useCallback((currentPlayerNum, targetPlayerNumber) => {
    setTargetSelection(prev => ({
      ...prev,
      [currentPlayerNum]: targetPlayerNumber,
    }));
  }, []);

    // 스테이지 변경 핸들러 - 모든 게임 로직의 중심
    const handleStageChange = useCallback(async () => {
      
      try {
          console.log("스테이지 변경:", { gameStatus, stageIndex });
          setPreviousGameStatus(gameStatus);

          switch (gameStatus) {
              case GAME_STATUS.NIGHT:
                  // 밤 종료 시 타겟 처리
                  const targetPlayerNumber = targetSelection[currentPlayer?.playerNumber];
                  if (targetPlayerNumber !== undefined) {
                      await handleTargetsUpdate(currentPlayer.playerNumber, targetPlayerNumber);
                  }
                  await handleNightActions(1);
                  if (!isHost) return;
                  sendGameSystemMessage("밤이 끝났습니다.");
                  updateGameStatus(GAME_STATUS.DELAY);
                  break;

              case GAME_STATUS.DAY:
                  if (!isHost) return;
                  sendGameSystemMessage("낮이 끝났습니다. 투표를 시작합니다.");
                  updateGameStatus(GAME_STATUS.DELAY);
                  break;

              case GAME_STATUS.VOTE:
                  if (!isHost) return;
                  const result = await processVoteResult();
                  if (result.success) {
                      sendGameSystemMessage("투표가 종료되었습니다.");
                      updateGameStatus(GAME_STATUS.DELAY);
                  }
                  break;

              case GAME_STATUS.FINALVOTE:
                  if (!isHost) return;
                  await processFinalVoteResult();
                  sendGameSystemMessage("최종 투표가 종료되었습니다.");
                  updateGameStatus(GAME_STATUS.DELAY);
                  break;

              case GAME_STATUS.DELAY:
                  if (!isHost) return;
                  const nextStatus = getNextStatusAfterDelay();
                  if (nextStatus) {
                      updateGameStatus(nextStatus);
                  }
                  break;
          }
      } catch (error) {
          console.error("스테이지 변경 중 오류:", error);
      }
  }, [
      isHost, gameStatus, stageIndex,
      currentPlayer, targetSelection, roomKey,
      handleTargetsUpdate, handleNightActions,
      processVoteResult, processFinalVoteResult,
      sendGameSystemMessage, updateGameStatus
  ]);

  const getNextStatusAfterDelay = useCallback(() => {
      const previousStatus = getPreviousStatus();
      switch (previousStatus) {
          case GAME_STATUS.NIGHT: return GAME_STATUS.DAY;
          case GAME_STATUS.DAY: return GAME_STATUS.VOTE;
          case GAME_STATUS.VOTE: return GAME_STATUS.FINALVOTE;
          case GAME_STATUS.FINALVOTE: return GAME_STATUS.NIGHT;
          default: return null;
      }
  }, [gameStatus]);

  const canModifyTime = useCallback(() => {
    if (!currentPlayer || !gameStatus) return false;
    return (
      gameStatus === "DAY" && 
      currentPlayer.isAlive && 
      !Array.from(timeModifiedPlayers).includes(currentPlayer.playerNumber)
    );
  }, [gameStatus, currentPlayer, timeModifiedPlayers]);

  const handleModifyTime = useCallback((adjustment) => {
    if (!canModifyTime() || !currentPlayer) return;
    modifyGameTime(adjustment);
    setTimeModifiedPlayers(prev => new Set([...prev, currentPlayer.playerNumber]));
    sendGameSystemMessage(
      `Player ${currentPlayer.playerNumber}님이 시간을 ${Math.abs(adjustment)}초 ${adjustment > 0 ? '증가' : '감소'}시켰습니다.`
    );
  }, [canModifyTime, modifyGameTime, currentPlayer, sendGameSystemMessage]);

  const handlePlayerSelect = useCallback((targetId) => {
    if (!currentPlayer || !gameStatus) return;
    if (gameStatus === "NIGHT" && currentPlayer.role === "MAFIA") {
      setTarget(targetId);
    } else if (gameStatus === "VOTE" && canVote()) {
      sendVote(targetId);
      sendGameSystemMessage(
        `Player ${currentPlayer.playerNumber}님이 Player ${targetId}님을 지목했습니다.`
      );
    }
    if (gameStatus !== "VOTE" && gameStatus !== "FINALVOTE" && gameStatus !== "NIGHT") {
      const player = players?.find((p) => p.playerNumber === targetId);
      if (player) {
        handleOpenPopup(`Player ${player.playerNumber} (${player.role})`);
      }
    }
  }, [gameStatus, currentPlayer, canVote, setTarget, sendVote, sendGameSystemMessage, players, handleOpenPopup]);

  // const handleTimerEnd = useCallback(async () => {
  //   if (!isHost) return;

  //   console.log("타이머 종료 이벤트:", { 
  //     gameStatus, 
  //     stageIndex,
  //     currentTime: gameTime 
  //   });
    
  //   if (gameStatus === GAME_STATUS.NIGHT) {
  //     console.log("밤 시간 종료 처리 시작");
  //     sendGameSystemMessage(`${stages[stageIndex].name} 시간이 종료되었습니다.`);
  //     await handleStageChange(1);
  //   } else if (gameStatus === GAME_STATUS.VOTE) {
  //     console.log("투표 시간 종료 처리 시작");
  //     const result = await processVoteResult();
  //     if (result.success) {
  //       sendGameSystemMessage(`투표가 종료되었습니다.`);
  //       updateGameStatus(NEXT_STATUS[gameStatus]);
  //     }
  //   } else {
  //     console.log(`${gameStatus} 시간 종료 처리 시작`);
  //     sendGameSystemMessage(`${stages[stageIndex].name} 시간이 종료되었습니다.`);
  //     updateGameStatus(NEXT_STATUS[gameStatus]);
  //   }
  // }, [
  //   isHost,
  //   gameStatus, 
  //   stageIndex, 
  //   gameTime,
  //   sendGameSystemMessage, 
  //   handleStageChange, 
  //   processVoteResult, 
  //   updateGameStatus
  // ]);

  // 이전 상태 가져오는 함수 추가
  const getPreviousStatus = useCallback(() => {
    return previousGameStatus;
  }, [previousGameStatus]);

  // 4. useEffect 선언
  useEffect(() => {
    if (gameStatus) {
      setStageIndex(STATUS_INDEX[gameStatus]);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus !== GAME_STATUS.DELAY) {
      setPreviousGameStatus(gameStatus);
    }
    if (gameStatus === 'NIGHT') {
      setTimeModifiedPlayers(new Set());
    }
  }, [gameStatus]);

  // 5. 초기화 체크는 마지막에
  const isGameInitialized = useMemo(() => {
    return (
      players?.length > 0 && 
      currentPlayer && 
      gameStatus !== null && 
      gameStatus !== 'NONE'
    );
  }, [players, currentPlayer, gameStatus]);

  if (!isGameInitialized) {
    return <div className="game-loading">게임 초기화 중...</div>;
  }

  // 6. 렌더링
  return (
    <div className={`game-room ${stageIndex === 1 ? "shadow-inset-top" : ""}`}>
      {currentPlayer && showFirstJobExplainPopup && (
        <FirstJobExplainpopUp
          currentPlayerRole={currentPlayer.role}
          onClose={handleCloseFirstJobExplainPopup}
        />
      )}
      <div className="chat-area">
        <div className="player-area">
          <div className="header">
            {players?.length > 0 && currentPlayer && (
              <Timer
                time={gameTime}
                gameStatus={gameStatus}
                dayCount={dayCount}
                onTimerEnd={handleStageChange}
                onModifyTime={handleModifyTime}
                canModifyTime={canModifyTime()}
              />
            )}
            <DayIndicator currentPhase={stageIndex === 1 ? "NIGHT" : "DAY"} />
          </div>
          {currentPlayer && <JobInfoIcon role={currentPlayer.role} />}
          <div className="player-cards">
            {players?.length > 0 ? (
              players.map((player, index) => (
                player && (
                  <PlayerCard
                    key={index}
                    name={`Player ${player.playerNumber}`}
                    index={player.playerNumber - 1}
                    role={player.role}
                    isNight={stageIndex === STATUS_INDEX[GAME_STATUS.NIGHT]}
                    currentPlayerRole={currentPlayer?.role}
                    currentPlayerNum={currentPlayer?.playerNumber}
                    onTargetChange={handleTargetChange}
                    isAlive={player.isAlive}
                    gameStatus={gameStatus}
                    voteStatus={voteStatus}
                    onClick={() => handlePlayerSelect(player.playerNumber)}
                  />
                )
              ))
            ) : (
              <div>플레이어 정보를 불러오는 중...</div>
            )}
          </div>
        </div>
        <ChatBox
          ref={chatBoxRef}
          stageIndex={stageIndex}
          messages={messages}
          canChat={canChat()}
          onSendMessage={sendGameMessage}
          currentPlayer={currentPlayer}
        />
      </div>
      {isPopupOpen && (
        <Popup onClose={handleClosePopup} selectedPlayer={selectedPlayer} />
      )}
    </div>
  );
};

export default GameRoom;
