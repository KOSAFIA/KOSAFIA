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
    isHost,          // 방장인지 아닌지
    updateGameStatus // 게임 상태 소켓 함수
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
