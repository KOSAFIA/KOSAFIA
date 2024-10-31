import React from "react";
import PlayerCard from "../components/PlayerCard";
import Timer from "../components/Timer";
import DayIndicator from "../components/DayIndicator";
import ChatBox from "../components/ChatBox";
import "../styles/components/Timer.css";
import "../styles/GameRoom.css";
import "../styles/components/PlayerCard.css";

const GameRoom = () => {
  return (
    <div className="game-room">
      <div className="chat-area">
        <div className="player-area">
          <div className="header">
            <Timer />
            <DayIndicator currentPhase="낮" />
          </div>
          <div className="player-cards"> 
            <PlayerCard name="본인 (마피아)" />
            {[...Array(7)].map((_, index) => (
              <PlayerCard key={index} name={`Player ${index + 2}`} />
            ))}
          </div>
        </div>
        <ChatBox />
      </div>
    </div>
  );
};

export default GameRoom;
