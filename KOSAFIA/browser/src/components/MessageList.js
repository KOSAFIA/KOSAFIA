import React from "react";
import "../styles/components/MessageList.css";

const roles = [
  { name: "MAFIA", image: "/img/mafia.png" },
  { name: "DOCTOR", image: "/img/doctor.png" },
  { name: "POLICE", image: "/img/police.png" },
  { name: "CITIZEN", image: "/img/citizen.png" },
];

// 마피아 색상 배열
const mafiaColors = [
  'rgba(255, 0, 0, 0.3)',   // 빨강
  'rgba(128, 0, 0, 0.3)',   // 진한 빨강
  'rgba(139, 0, 0, 0.3)',   // 다크레드
  'rgba(178, 34, 34, 0.3)', // 파이어브릭
];

const MessageList = ({ messages = [], currentPlayer, currentRole }) => {
  const getMafiaColorClass = (playerNumber) => {
    return `mafia-overlay-${playerNumber % mafiaColors.length}`;
  };

  const getPlayerImage = (playerNumber, isOwnMessage, msg) => {
    const isMafiaSharingEnabled = currentRole === 'MAFIA' && msg.role === 'MAFIA';
    if (isOwnMessage || isMafiaSharingEnabled) {
      const playerRole = roles.find(role => role.name === (isOwnMessage ? currentRole : msg.role));
      return playerRole ? playerRole.image : "/img/default-avatar.png";
    }
    return "/img/default-avatar.png";
  };

  if (!currentPlayer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="message-list">
      {messages.map((msg, index) => {
        if (!msg) return null;

        if (msg.isSystemMessage) {
          return (
            <div key={index} className="system-message">
              <div className="message-box system">
                <span className="message-text">{msg.content}</span>
              </div>
            </div>
          );
        }

        const isOwnMessage = msg.playerNumber === currentPlayer.playerNumber;
        const mafiaClass = currentRole === 'MAFIA' && msg.role === 'MAFIA' 
          ? getMafiaColorClass(msg.playerNumber)
          : '';

        return (
          <div key={index} className={`message ${isOwnMessage ? "own-message" : "other-message"}`}>
            {isOwnMessage ? (
              // 내 메시지 (오른쪽 정렬)
              <>
                <div className="message-box">
                  <span className="message-text">{msg.content}</span>
                </div>
                <div className="message-icon-container">
                  <div className={`message-icon ${mafiaClass}`} 
                       style={{ backgroundImage: `url(${getPlayerImage(msg.playerNumber, true, msg)})` }}>
                    <span className="player-name">나</span>
                  </div>
                </div>
              </>
            ) : (
              // 상대방 메시지 (왼쪽 정렬)
              <>
                <div className="message-icon-container">
                  <div className={`message-icon ${mafiaClass}`}
                       style={{ backgroundImage: `url(${getPlayerImage(msg.playerNumber, false, msg)})` }}>
                    <span className="player-name">{msg.username}</span>
                  </div>
                </div>
                <div className="message-box">
                  <span className="message-text">{msg.content}</span>
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
