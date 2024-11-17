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

const MessageList = ({ messages, currentPlayer, currentRole }) => {
  // 마피아 메시지별 고유 색상 할당
  const mafiaColorMap = React.useMemo(() => {
    const colorMap = new Map();
    messages.forEach(msg => {
      if (!colorMap.has(msg.player)) {
        const randomColor = mafiaColors[Math.floor(Math.random() * mafiaColors.length)];
        colorMap.set(msg.player, randomColor);
      }
    });
    return colorMap;
  }, [messages]);

  const getPlayerImage = (playerName, isOwnMessage, msg) => {
    // 현재 플레이어가 마피아이고, 메시지 보낸 사람도 마피아인 경우
    const isMafiaSharingEnabled = currentRole === 'MAFIA' && msg.role === 'MAFIA';
    
    if (isOwnMessage || isMafiaSharingEnabled) {
      const playerRole = roles.find(role => role.name === (isOwnMessage ? currentRole : msg.role));
      return playerRole ? playerRole.image : "/img/default-avatar.png";
    }
    return "/img/default-avatar.png";
  };

  const getMafiaOverlay = (msg, isOwnMessage) => {
    if (currentRole === 'MAFIA' && msg.role === 'MAFIA') {
      return {
        backgroundColor: mafiaColorMap.get(msg.player),
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '50%',
        pointerEvents: 'none'
      };
    }
    return null;
  };

  return (
    <div className="message-list">
      {messages.map((msg, index) => {
        const isOwnMessage = msg.player === currentPlayer;
        const playerImage = getPlayerImage(msg.player, isOwnMessage, msg);
        const mafiaOverlay = getMafiaOverlay(msg, isOwnMessage);

        const messageClassName = msg.isTimeModifiedMessage
          ? "time-modified-message"
          : `message ${isOwnMessage ? "own-message" : "other-message"}`;

        return (
          <div key={index} className={messageClassName}>
            {msg.isTimeModifiedMessage ? (
              <div className="message-box">
                <span className="message-text">{msg.text}</span>
              </div>
            ) : (
              <>
                {isOwnMessage ? (
                  <>
                    <div className="message-icon-container">
                      <div
                        className="message-icon"
                        style={{ backgroundImage: `url(${playerImage})` }}
                      >
                        {mafiaOverlay && <div style={mafiaOverlay} />}
                        <span className="player-name">나</span>
                      </div>
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
                    <div className="message-icon-container">
                      <div
                        className="message-icon"
                        style={{ backgroundImage: `url(${playerImage})` }}
                      >
                        {mafiaOverlay && <div style={mafiaOverlay} />}
                        <span className="player-name">{msg.player}</span>
                      </div>
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
