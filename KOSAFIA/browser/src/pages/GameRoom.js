import React, { useState, useRef, useEffect } from "react";
import PlayerCard from "../components/PlayerCard";
import Timer from "../components/Timer";
import DayIndicator from "../components/DayIndicator";
import ChatBox from "../components/ChatBox";
import Popup from "../components/JobExpectationPopUp";
import JobInfoIcon from "../components/JobInfoIcon";
import useJobInfo from "../hooks/game/useJobInfo";
import { useGameContext } from "../contexts/socket/game/GameSocketContext";
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
    canChat
  } = useGameContext();

  // playerNumbers 상태 유지
  const [playerNumbers, setPlayerNumbers] = useState([]);

  // useJobInfo 훅 사용 유지
  const PlayerInfo = useJobInfo(playerNumbers);

  // PlayerInfo 업데이트 부분 수정
  useEffect(() => {
    if (players.length > 0) {
      // playerNumbers 업데이트
      const numbers = players.map(p => p.playerNumber);
      setPlayerNumbers(numbers);

      // 서버의 플레이어 정보를 PlayerInfo 형식에 맞게 업데이트
      players.forEach(serverPlayer => {
        const localPlayer = PlayerInfo.find(p => p.playerNumber === serverPlayer.playerNumber);
        if (localPlayer) {
          // 기존 PlayerInfo 구조 유지하면서 서버 데이터 반영
          Object.assign(localPlayer, {
            role: serverPlayer.role || localPlayer.role,
            isAlive: serverPlayer.isAlive ?? true,
            isVoteTarget: serverPlayer.isVoteTarget ?? false,
            username: serverPlayer.username || `Player ${serverPlayer.playerNumber}`
          });
        }
      });
    }
  }, [players, PlayerInfo]);

  // 게임 상태에 따른 stageIndex 설정
  useEffect(() => {
    const newStageIndex = (() => {
      switch(gameStatus) {
        case 'NIGHT': return 1;
        case 'DAY': return 0;
        case 'VOTE': return 2;
        case 'FINALVOTE': return 3;
        default: return 0;
      }
    })();
    setStageIndex(newStageIndex);
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
    const player = PlayerInfo.find(p => p.playerNumber === targetId);
    if (player) {
      const playerName = `Player ${player.playerNumber} (${player.role})`;
      handleOpenPopup(playerName);
    }
  };

  return (
    <div className={`game-room ${stageIndex === 1 ? "shadow-inset-top" : ""}`}>
      <div className="chat-area">
        <div className="player-area">
          <div className="header">
            {PlayerInfo.length > 0 && (
              <Timer
                onSendMessage={sendMessageToChat}
                onStageChange={setStageIndex}
                playerNumber={currentPlayer?.playerNumber}
                role={currentPlayer?.role}
              />
            )}
            <DayIndicator currentPhase={stageIndex === 1 ? "밤" : "낮"} />
          </div>
          {currentPlayer && <JobInfoIcon role={currentPlayer.role} />}
          <div className="player-cards">
            {PlayerInfo.map((player, index) => (
              <PlayerCard
                key={index}
                name={`Player ${player.playerNumber}`}
                index={player.playerNumber - 1}
                role={player.role}
                isNight={stageIndex === 1}
                isSelected={mafiaTarget === player.playerNumber}
                onClick={() => {
                  const playerName = `Player ${player.playerNumber} (${player.role})`;
                  console.log("Opening Popup for:", playerName);
                  handleOpenPopup(playerName);
                  handlePlayerSelect(player.playerNumber);
                }}
              />
            ))}
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
