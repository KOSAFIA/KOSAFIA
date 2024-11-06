import React from "react";
import "../styles/components/MessageList.css";

const roles = [
  { name: "MAFIA", image: "/img/mafia.jpeg" },
  { name: "DOCTOR", image: "/img/doctor.jpeg" },
  { name: "POLICE", image: "/img/police.jpeg" },
  { name: "CITIZEN", image: "/img/citizen.png" },
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

        const messageClassName = msg.isTimeModifiedMessage
          ? "time-modified-message"
          : `message ${isOwnMessage ? "own-message" : "other-message"}`;

        return (
          <div key={index} className={messageClassName}>
            {/* 시간 수정 메시지인 경우 아이콘같은 거 표시 X */}
            {msg.isTimeModifiedMessage ? (
              <div className="message-box">
                <span className="message-text">{msg.text}</span>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
