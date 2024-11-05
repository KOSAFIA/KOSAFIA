// MessageList.js
import React, { useState } from "react";
import "../styles/components/MessageList.css";

const roles = [
  { name: "Player1", image: "/img/mafia.jpeg" },
  { name: "Player2", image: "/img/doctor.jpeg" },
  { name: "Player3", image: "/img/police.jpeg" },
  { name: "Player4", image: "/img/citizen.png" },
];

const MessageList = ({ messages, currentPlayer }) => {
  const getPlayerImage = (playerName) => {
    const player = roles.find((role) => role.name === playerName);
    return player ? player.image : "/img/default-avatar.png";
  };

  return (
    <div className="message-list">
      {messages.map((msg, index) => {
        const isOwnMessage = msg.player === currentPlayer; // 본인 메시지 여부 확인
        const playerImage = getPlayerImage(msg.player); // 역할 이미지 가져오기

        return (
          <div
            key={index}
            className={`message ${
              isOwnMessage ? "own-message" : "other-message"
            }`}
          >
            {isOwnMessage ? (
              <>
                <div
                  className="message-icon"
                  style={{ backgroundImage: `url(${playerImage})` }}
                >
                  <span className="player-name">나</span>
                </div>
                <div className="message-box">
                  <span className="message-text">{msg.text}</span>
                </div>
              </>
            ) : (
              <>
                <div className="message-box">
                  <span className="message-text">{msg.text}</span>
                </div>
                <div
                  className="message-icon"
                  style={{ backgroundImage: `url(${playerImage})` }}
                >
                  <span className="player-name">{msg.player}</span>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
