import React, { useState, useRef, useEffect, useCallback } from "react";
import PlayerCard from "../components/PlayerCard";
import Timer from "../components/Timer";
import DayIndicator from "../components/DayIndicator";
import ChatBox from "../components/ChatBox";
import Popup from "../components/JobExpectationPopUp";
import JobInfoIcon from "../components/JobInfoIcon";
// import useJobInfo from "../hooks/game/useJobInfo";
import handleTargetsUpdate from "../hooks/game/HandleTargetsUpdate";
import handleNightActions from "../hooks/game/HandleNightAction";
import "../styles/GameRoom.css";
import { useGameContext } from "../contexts/socket/game/GameSocketContext";

const GameRoom = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const chatBoxRef = useRef();
  const [targetSelection, setTargetSelection] = useState({}); // 각 플레이어가 선택한 타겟을 저장
  
  // GameSocketContext에서 필요한 상태들을 가져옴
  const { 
    roomKey,
    players,
    messages,
    gameStatus,
    currentPlayer,
    mafiaTarget,
    setTarget,
    canVote,
    sendVote,
    sendGameMessage,
    canChat,
    isHost,          // 방장 여부 추가
    updateGameStatus // 게임 상태 업데이트 함수 추가
  } = useGameContext();


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
    if (newStageIndex === 5) {
      // 모든 플레이어의 타겟 정보를 서버로 전송
      Object.entries(targetSelection).forEach(([playerNum, target]) => {
        handleTargetsUpdate(playerNum, target);
      });

      // 서버에 요청을 보내서 밤 단계의 행동을 처리
      handleNightActions(players); // players를 전달
    }
  };

  // 타겟 변경을 처리하는 함수
  const handleTargetChange = (playerNumber, targetPlayerNumber) => {
    setTargetSelection((prev) => ({
      ...prev,
      [playerNumber]: targetPlayerNumber,
    }));
    // 타겟 정보는 밤 단계가 끝난 후 한 번에 서버로 전송하므로 여기서는 서버로 전송하지 않음
  };

  return (
    <div className={`game-room ${stageIndex === 1 ? "shadow-inset-top" : ""}`}>
      <div className="chat-area">
        <div className="player-area">
          <div className="header">
            {players.length > 0 && currentPlayer && (
              <Timer
                onStageChange={handleStageChange}
                onSendMessage={sendMessageToChat}
                playerNumber={currentPlayer.playerNumber}
                role={currentPlayer.role}
              />
            )}
            <DayIndicator currentPhase={stageIndex === 1 ? "밤" : "낮"} />
          </div>
          {currentPlayer && <JobInfoIcon role={currentPlayer.role} />}
          <div className="player-cards">
            {players.length > 0 ? (
              players.map((player, index) => (
                <PlayerCard
                  key={player.playerNumber}
                  name={`Player ${player.playerNumber}`}
                  index={player.playerNumber - 1}
                  role={player.role}
                  isNight={stageIndex === 4}
                  currentPlayerNum={currentPlayer.playerNumber}
                  onTargetChange={handleTargetChange}
                  onClick={() => {
                    const playerName = `Player ${player.playerNumber} (${player.role})`;
                    handleOpenPopup(playerName);
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
