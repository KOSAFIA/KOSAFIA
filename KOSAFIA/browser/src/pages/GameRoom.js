import React, { useState } from "react";
import PlayerCard from "../components/PlayerCard";
import Timer from "../components/Timer";
import DayIndicator from "../components/DayIndicator";
import ChatBox from "../components/ChatBox";
import Popup from "../components/JobExpectationPopUp"; // Popup 컴포넌트 import
import "../styles/components/Timer.css";
import "../styles/GameRoom.css";
import "../styles/components/PlayerCard.css";

const GameRoom = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const handleOpenPopup = (playerName) => {
    setSelectedPlayer(playerName);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedPlayer(null);
  };

  return (
    <div className="game-room">
      <div className="chat-area">
        <div className="player-area">
          <div className="header">
            <Timer />
            <DayIndicator currentPhase="낮" />
          </div>
          <div className="player-cards"> 
            <PlayerCard name="본인 (마피아)" onClick={() => handleOpenPopup("본인 (마피아)")} />
            {[...Array(7)].map((_, index) => (
              <PlayerCard key={index} name={`Player ${index + 2}`} onClick={() => handleOpenPopup(`Player ${index + 2}`)} />
            ))}
          </div>
        </div>
        <ChatBox />
      </div>
      {/* 팝업을 GameRoom 안에 두기 */}
      {isPopupOpen && (
        <Popup onClose={handleClosePopup} selectedPlayer={selectedPlayer} />
      )}
    </div>
  );
};

export default GameRoom;
