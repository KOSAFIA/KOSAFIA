import React, { useState, useRef, useEffect } from "react";
import PlayerCard from "../components/PlayerCard";
import Timer from "../components/Timer";
import DayIndicator from "../components/DayIndicator";
import ChatBox from "../components/ChatBox";
import Popup from "../components/JobExpectationPopUp";
import JobInfoIcon from "../components/JobInfoIcon";
import useJobInfo from "../hooks/game/useJobInfo";
import "../styles/GameRoom.css";

const GameRoom = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const chatBoxRef = useRef();

  // 방에 있는 플레이어 번호를 서버나 소켓에서 동적으로 받아옵니다.
  const [playerNumbers, setPlayerNumbers] = useState([]);

  // 서버나 소켓에서 플레이어 목록을 실시간으로 받아오는 방식 (후에 수정하기)
  useEffect(() => {
    // 예시로 Socket 이벤트를 통해 플레이어 목록을 받아올 수 있습니다.
    // socket.on('playerJoined', (newPlayerNumber) => {
    //   setPlayerNumbers((prev) => [...prev, newPlayerNumber]);
    // });

    // 예시로 방에 있는 플레이어 번호를 임의로 설정 (실제로는 서버에서 받아올 것)
    setPlayerNumbers([1, 2, 3, 4, 5, 6, 7, 8]);
  }, []);

  // useJobInfo 훅을 통해 실제 역할 정보 목록을 가져옴
  const PlayerInfo = useJobInfo(playerNumbers);

  const sendMessageToChat = (message) => {
    chatBoxRef.current?.receiveMessage(message);
  };

  const handleStageChange = (newStageIndex) => {
    setStageIndex(newStageIndex);
  };

  const handleOpenPopup = (playerName) => {
    setSelectedPlayer(playerName);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedPlayer(null);
  };

  return (
    <div className={`game-room ${stageIndex === 1 ? "shadow-inset-top" : ""}`}>
      <div className="chat-area">
        <div className="player-area">
          <div className="header">
            {/* Timer에서 role과 playerNumber를 전달 */}
            {PlayerInfo.length > 0 && (
              <Timer
                onSendMessage={sendMessageToChat}
                onStageChange={handleStageChange}
                playerNumber={PlayerInfo[0].playerNumber} // 첫 번째 플레이어 번호 전달
                role={PlayerInfo[0].role} // 첫 번째 플레이어 역할 전달
              />
            )}
            <DayIndicator currentPhase={stageIndex === 1 ? "밤" : "낮"} />
          </div>
          {PlayerInfo.length > 0 && <JobInfoIcon role={PlayerInfo[0].role} />}
          <div className="player-cards">
            {PlayerInfo.map((player, index) => {
              return (
                <PlayerCard
                  key={index}
                  name={`Player ${player.playerNumber}`} // playerNumber로 플레이어 이름 생성
                  index={player.playerNumber - 1}
                  role={player.role} // player.role을 그대로 전달
                  isNight={stageIndex === 4} // 밤인지 여부
                  onClick={() => {
                    const playerName = `Player ${player.playerNumber} (${player.role})`;
                    console.log("Opening Popup for:", playerName); // 클릭 시 확인
                    handleOpenPopup(playerName);
                  }}
                />
              );
            })}
          </div>
        </div>
        <ChatBox ref={chatBoxRef} stageIndex={stageIndex} />
      </div>
      {isPopupOpen && (
        <Popup onClose={handleClosePopup} selectedPlayer={selectedPlayer} />
      )}
    </div>
  );
};

export default GameRoom;
