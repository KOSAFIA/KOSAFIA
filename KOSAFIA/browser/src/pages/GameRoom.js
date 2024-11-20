import React, { useState, useRef, useEffect, useCallback } from "react";
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
  { name: "FIRSTDELAY", image: "/img/day.png" },

  { name: "DAY", image: "/img/day.png" },
  { name: "SECONDDELAY", image: "/img/day.png" },

  { name: "VOTE", image: "/img/vote.png" },
  { name: "THIRDDELAY", image: "/img/day.png" },

  { name: "FINALVOTE", image: "/img/discussion.png" },
  { name: "FOURTHDELAY", image: "/img/day.png" }
];

const GameRoom = () => {
  const [showFirstJobExplainPopup, setFirstJobExplainPopup] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [targetSelection, setTargetSelection] = useState({}); // 각 플레이어가 선택한 타겟을 저장
  const chatBoxRef = useRef();

  // GameSocketContext에서 필요한 상태들을 가져옴
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
    processVoteResult,
    processFinalVoteResult,
    sendFinalVote,
    canFinalVote,
    voteStatus,
    finalVotes
  } = useGameContext();

  // 시간 조절한 플레이어 목록 관리 (새로운 게임 시작 시 초기화 필요)
  const [timeModifiedPlayers, setTimeModifiedPlayers] = useState(new Set());

  // 게임 상태에 따른 stageIndex 설정
  useEffect(() => {
    // 나이트:0 딜레이:1 데이:2 투표:3 최후의변론:4
    setStageIndex(STATUS_INDEX[gameStatus]);
  }, [gameStatus]);

  // 게임 상태가 변경될 때 timeModifiedPlayers 초기화
  useEffect(() => {
    if (gameStatus === 'NIGHT') {
      setTimeModifiedPlayers(new Set());
    }
  }, [gameStatus]);

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

  //하은님 구현
  const handleStageChange = async (newStageIndex) => {
    setStageIndex(newStageIndex);

    if (gameStatus === GAME_STATUS.NIGHT) {
        const targetPlayerNumber = targetSelection[currentPlayer.playerNumber];

        // 1. 먼저 타겟 정보 전송
        if (targetPlayerNumber !== undefined) {
            await handleTargetsUpdate(currentPlayer.playerNumber, targetPlayerNumber);
        }

        // 2. 밤 액션 처리
        await handleNightActions(roomKey); 

        // 3. 모든 처리가 완료된 후에만 상태 업데이트
        if (isHost) {
            updateGameStatus(NEXT_STATUS[gameStatus]);
        }
    }
};

  // 밤 이벤트 처리를 위한 새로운 함수
const handleNightEvent = async () => {
  // 1. 스테이지 인덱스 업데이트
  setStageIndex(1);

  // 2. 타겟 정보 처리 (모든 플레이어)
  const targetPlayerNumber = targetSelection[currentPlayer.playerNumber];
  
  if (targetPlayerNumber !== undefined) {
      await handleTargetsUpdate(currentPlayer.playerNumber, targetPlayerNumber);
  }

  // 3. 밤 행동 처리 (모든 플레이어)
  await handleNightActions(1);
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
    if (gameStatus === "NIGHT" && currentPlayer?.role === "MAFIA") {
      setTarget(targetId);
    } else if (gameStatus === "VOTE" && canVote()) {
      sendVote(targetId);
    }

    // 기존의 팝업 로직 유지
    const player = players.find((p) => p.playerNumber === targetId);
    if (player) {
      const playerName = `Player ${player.playerNumber} (${player.role})`;
      handleOpenPopup(playerName);
    }
  };

  // 시간 조절 가능 여부 체크
  const canModifyTime = useCallback(() => {
    return gameStatus === "DAY" && 
           currentPlayer?.isAlive && 
           !timeModifiedPlayers.has(currentPlayer?.playerNumber);
  }, [gameStatus, currentPlayer, timeModifiedPlayers]);

  // 시스템 메시지 전송을 위한 통합 핸들러
  const sendGameSystemMessage = useCallback((message) => {
    sendSystemMessage(message);
    // 채팅창에도 시스템 메시지 표시
    sendMessageToChat({
      text: message,
      isSystemMessage: true
    });
  }, [sendSystemMessage]);

  // 게임 상태 변경 시 시스템 메시지 전송
  useEffect(() => {
    if (gameStatus && isHost) {
      sendGameSystemMessage(`${gameStatus} 시간이 시작되었습니다.`);
    }
  }, [gameStatus, gameStatus, sendGameSystemMessage, isHost]);

  // 시간 조절 핸들러 수정
  const handleModifyTime = useCallback((adjustment) => {
    if (canModifyTime()) {
      modifyGameTime(adjustment);
      // 시간 조절한 플레이어 추가
      setTimeModifiedPlayers(prev => new Set([...prev, currentPlayer.playerNumber]));
      
      // 시간 조절 시스템 메시지
      sendGameSystemMessage(
        `Player ${currentPlayer.playerNumber}님이 시간을 ${Math.abs(adjustment)}초 ${adjustment > 0 ? '증가' : '감소'}시켰습니다.`
      );
    }
  }, [canModifyTime, modifyGameTime, currentPlayer, sendGameSystemMessage]);

// handleTimerEnd에서는 handleStageChange 호출하도록 수정
const handleTimerEnd = useCallback(async () => {
  if (gameStatus === GAME_STATUS.NIGHT) {
      if (isHost) {
          sendGameSystemMessage(`${gameStatus} 시간이 종료되었습니다.`);
      }
      // handleStageChange를 통해 모든 처리를 일관되게 진행
      await handleStageChange(1);
  } else {
      if (isHost) {
          sendGameSystemMessage(`${gameStatus} 시간이 종료되었습니다.`);
          updateGameStatus(NEXT_STATUS[gameStatus]);
      }
  }
}, [isHost, gameStatus, stageIndex, updateGameStatus, sendGameSystemMessage]);


  const [customIdx, setCustomIdx] = useState(0);
  // 다음 페이즈로 넘어가는 핸들러 추가
  const handleNextPhase = useCallback(async () => {
    if (gameStatus === GAME_STATUS.NIGHT) {
      const targetPlayerNumber = targetSelection[currentPlayer.playerNumber];

      // 1. 먼저 타겟 정보 전송
      if (targetPlayerNumber !== undefined) {
        await handleTargetsUpdate(currentPlayer.playerNumber, targetPlayerNumber);
      }
      // 2. 밤 액션 처리
      await handleNightActions(1); 
    }else if (gameStatus === GAME_STATUS.DAY) {
      // await handleDayActions(1);
    }else if (gameStatus === GAME_STATUS.VOTE) {
      if(isHost) {
        processVoteResult();
      }
    }else if (gameStatus === GAME_STATUS.FINALVOTE) {
      if(isHost) {
        processFinalVoteResult();
      }
    }else if(gameStatus === GAME_STATUS.FIRSTDELAY) {

    }
    else if(gameStatus === GAME_STATUS.SECONDDELAY) {
    }
    else if(gameStatus === GAME_STATUS.THIRDDELAY) {

    }
    else if(gameStatus === GAME_STATUS.FOURTHDELAY) {

    }

    if (isHost) {
      sendGameSystemMessage(`${gameStatus} 단계가 종료되었습니다.`);
      // 다음 상태로 업데이트
      updateGameStatus(NEXT_STATUS[gameStatus]);
    }

  }, [isHost, gameStatus, stageIndex, updateGameStatus, sendGameSystemMessage]);

  // messages 상태 디버깅을 위한 useEffect 추가
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  // currentPlayer 상태 디버깅을 위한 useEffect 추가
  useEffect(() => {
    console.log('Current player updated:', currentPlayer);
  }, [currentPlayer]);

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
            {players.length > 0 && currentPlayer && (
              <Timer
                time={gameTime}
                gameStatus={gameStatus}
                dayCount={dayCount}
                onTimerEnd={handleTimerEnd}
                onModifyTime={handleModifyTime}
                canModifyTime={canModifyTime()}
              />
            )}
            {isHost && (
                <button 
                  className="next-phase-btn"
                  onClick={handleNextPhase}
                >
                  다음 단계
                </button>
            )}
            <DayIndicator currentPhase={stageIndex === 1 ? "NIGHT" : "DAY"} />
          </div>
          {currentPlayer && <JobInfoIcon role={currentPlayer.role} />}
          <div className="player-cards">
            {players.length > 0 ? (
              players.map((player, index) => (
                <PlayerCard
                  key={index}
                  name={`Player ${player.playerNumber}`}
                  index={player.playerNumber - 1}
                  role={player.role}
                  isNight={stageIndex === STATUS_INDEX[GAME_STATUS.NIGHT]}
                  currentPlayerRole={currentPlayer.role}
                  currentPlayerNum={currentPlayer.playerNumber}
                  onTargetChange={handleTargetChange}
                  isAlive={player.isAlive}
                  gameStatus={gameStatus}
                  voteCount={voteStatus[player.playerNumber] || 0}
                  agreeCount={finalVotes.agree || 0}
                  disagreeCount={finalVotes.disagree || 0}
                  isVoteTarget={player.isVoteTarget}
                  onClick={() => {
                    // 투표 단계에서는 팝업을 열지 않고 투표만 처리
                    if (gameStatus === GAME_STATUS.VOTE && canVote()) {
                      sendVote(player.playerNumber);
                    } else if (gameStatus === GAME_STATUS.FINALVOTE && canFinalVote() && player.isVoteTarget) {
                      // sendFinalVote(player.playerNumber); 플레이어 카드를 클릭하는거로 처리할수가 없겠어..
                    } else {
                      const playerName = `Player ${player.playerNumber} (${player.role})`;
                      handleOpenPopup(playerName);
                      handlePlayerSelect(player.playerNumber);
                    }
                  }}
                  onFinalVoteClick={(isAgreeButtonValue) => {
                    if (gameStatus === GAME_STATUS.FINALVOTE && canFinalVote() && player.isVoteTarget) {
                      sendFinalVote(isAgreeButtonValue);
                    }
                  }}
                />
              ))
            ) : (
              <div>플레이어 정보를 불러오는 중...</div>
            )}
          </div>
        </div>
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
    </div>
  );
};

export default GameRoom;
