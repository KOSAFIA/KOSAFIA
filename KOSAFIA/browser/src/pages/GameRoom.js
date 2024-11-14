import React, { useState, useRef, useEffect, useCallback } from "react";
import PlayerCard from "../components/PlayerCard";
import Timer from "../components/Timer";
import DayIndicator from "../components/DayIndicator";
import ChatBox from "../components/ChatBox";
import Popup from "../components/JobExpectationPopUp";
import JobInfoIcon from "../components/JobInfoIcon";
//import useJobInfo from "../hooks/game/useJobInfo"; 소켓 컨텍스트의 players로 정확히 대체됨.
import { useGameContext } from "../contexts/socket/game/GameSocketContext";
import { GAME_STATUS, NEXT_STATUS, STATUS_INDEX } from '../constants/GameStatus';
import "../styles/GameRoom.css";

const GameRoom = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const chatBoxRef = useRef();
  
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

  // 플레이어 선택 핸들러 수정
  const handlePlayerSelect = (targetId) => {
    if (gameStatus === 'NIGHT' && currentPlayer?.role === 'MAFIA') {
      setTarget(targetId);
    } else if (gameStatus === 'VOTE' && canVote()) {
      sendVote(targetId);
    }
    
    // 기존의 팝업 로직 유지
    const player = players.find(p => p.playerNumber === targetId);
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
      isSystemMessage: true
    });

    // 3. 방장만 다음 상태로 전환 요청
    if (isHost) {
      setTimeout(() => {
        const nextStatus = NEXT_STATUS[gameStatus];
        if (nextStatus) {
          try {
            updateGameStatus(nextStatus);
            console.log('게임 상태 변경 요청:', nextStatus);
          } catch (error) {
            console.error('게임 상태 변경 실패:', error);
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
                onSendMessage={sendMessageToChat}
                onStageChange={setStageIndex}
                onTimerEnd={handleTimerEnd}
                playerNumber={currentPlayer.playerNumber}
                role={currentPlayer.role}
                gameStatus={gameStatus}
              />
            )}
            <DayIndicator currentPhase={stageIndex === 1 ? "밤" : "낮"} />
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
                  isSelected={mafiaTarget === player.playerNumber}
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
