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
import {
  GAME_STATUS,
  NEXT_STATUS,
  STATUS_INDEX,
} from "../constants/GameStatus";
import "../styles/GameRoom.css";

const GameRoom = () => {
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
  } = useGameContext();

  // 게임 상태에 따른 stageIndex 설정
  useEffect(() => {
    //기존 코드 수정해야함. 자바 이넘과 동일하게 통일일
    setStageIndex(STATUS_INDEX[gameStatus]);
  }, [gameStatus]);

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

  // 단계가 변경될 때 호출되는 함수
  const handleStageChange = (newStageIndex) => {
    setStageIndex(newStageIndex);

    // 밤 단계(4)가 끝나고 test 단계(5)로 변경될 때 타겟 업데이트 실행
    if (newStageIndex === gameStatus.test) {
      // 플레이어의 타겟 정보를 서버로 전송

      console.log("cureentPlayer.playerNumber : " + currentPlayer.playerNumber);
      console.log("currentPlayer.target : " + currentPlayer.target);
      handleTargetsUpdate(currentPlayer.playerNumber, currentPlayer.target);

      // 서버에 요청을 보내서 밤 단계의 행동을 처리
      // handleNightActions(players); // players를 전달
    }
  };

  // 타겟 변경을 처리하는 함수
  const handleTargetChange = (currentPlayerNum, targetPlayerNumber) => {
    console.log("handleTargetChange 함수 실행");
    setTargetSelection((prev) => ({
      ...prev,
      [currentPlayerNum]: targetPlayerNumber,
    }));
    // 타겟 정보는 밤 단계가 끝난 후 한 번에 서버로 전송하므로 여기서는 서버로 전송하지 않음
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

  // 타이머 종료 핸들러
  const handleTimerEnd = useCallback(() => {
    // 1. 현재 상태를 DELAY로 변경
    setStageIndex(STATUS_INDEX[GAME_STATUS.DELAY]);

    // 2. 시스템 메시지 전송
    sendMessageToChat({
      content: `${gameStatus} 시간이 종료되었습니다.`,
      isSystemMessage: true,
    });

    // 3. 방장만 다음 상태로 전환 요청
    if (isHost) {
      setTimeout(() => {
        const nextStatus = NEXT_STATUS[gameStatus];
        if (nextStatus) {
          try {
            updateGameStatus(nextStatus);
            console.log("게임 상태 변경 요청:", nextStatus);
          } catch (error) {
            console.error("게임 상태 변경 실패:", error);
          }
        }
      }, 1000);
    }
  }, [gameStatus, isHost, updateGameStatus, sendMessageToChat]);

  return (
    <div className={`game-room ${stageIndex === 1 ? "shadow-inset-top" : ""}`}>
      <div className="chat-area">
        <div className="player-area">
          <div className="header">
            {players.length > 0 && currentPlayer && (
              <Timer
                onStageChange={handleStageChange}
                onSendMessage={sendMessageToChat}
                // onStageChange={setStageIndex}
                onTimerEnd={handleTimerEnd}
                playerNumber={currentPlayer.playerNumber}
                role={currentPlayer.role}
                gameStatus={gameStatus}
              />
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
                  onClick={() => {
                    const playerName = `Player ${player.playerNumber} (${player.role})`;
                    handleOpenPopup(playerName);
                    handlePlayerSelect(player.playerNumber);
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
