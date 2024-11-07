import React, { useState, useRef } from "react";
import PlayerCard from "../components/PlayerCard";
import Timer from "../components/Timer";
import DayIndicator from "../components/DayIndicator";
import ChatBox from "../components/ChatBox";
import Popup from "../components/JobExpectationPopUp";
import "../styles/components/Timer.css";
import "../styles/GameRoom.css";
import "../styles/components/PlayerCard.css";
import JobInfoIcon from "../components/JobInfoIcon";

const GameRoom = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [stageIndex, setStageIndex] = useState(0); // 단계 인덱스를 상태로 추가
  const chatBoxRef = useRef();

  // ChatBox에 메시지를 전달하는 함수
  const sendMessageToChat = (message) => {
    chatBoxRef.current?.receiveMessage(message);
  };

  // Timer의 단계 변경 시 호출되는 함수
  const handleStageChange = (newStageIndex) => {
    setStageIndex(newStageIndex);
  };

  // 팝업창 여는 함수
  const handleOpenPopup = (playerName) => {
    setSelectedPlayer(playerName);
    setIsPopupOpen(true);
  };

  // 팝업창 닫는 함수
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedPlayer(null);
  };

  return (
    
    <div className={`game-room ${stageIndex === 1 ? "shadow-inset-top" : ""}`}>
      <div className="chat-area">
        <div className="player-area">
          <div className="header">
            <Timer
              onSendMessage={sendMessageToChat}
              onStageChange={handleStageChange}
              playerName="본인"
            />
            <DayIndicator currentPhase={stageIndex === 1 ? "밤" : "낮"} />
          </div>
          <JobInfoIcon />
          <div className="player-cards">
            {/* 여기 하드코딩 되어있는 상황. 후에 수정해야함. */}
            <div className="player-cards">
              <PlayerCard
                name="본인 (마피아)"
                index={0}
                onClick={() => handleOpenPopup("본인 (마피아)")}
              />
              {[...Array(7)].map((_, index) => (
                <PlayerCard
                  key={index}
                  name={`Player ${index + 2}`}
                  index={index + 1}
                  onClick={() => handleOpenPopup(`Player ${index + 2}`)}
                />
              ))}
            </div>
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
