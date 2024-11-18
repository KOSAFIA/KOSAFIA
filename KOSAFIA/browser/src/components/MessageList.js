import React from "react";
import "../styles/components/MessageList.css";

const roles = [
  { name: "MAFIA", image: "/img/mafia.png" },
  { name: "DOCTOR", image: "/img/doctor.png" },
  { name: "POLICE", image: "/img/police.png" },
  { name: "CITIZEN", image: "/img/citizen.png" },
];

const mafiaColors = [
  'rgba(255, 0, 0, 0.3)',   
  'rgba(128, 0, 0, 0.3)',   
  'rgba(139, 0, 0, 0.3)',   
  'rgba(178, 34, 34, 0.3)', 
];

const MessageList = ({ messages, currentPlayer }) => {
  const mafiaColorMap = React.useMemo(() => {
    const colorMap = new Map();
    messages.forEach(msg => {
      if (!colorMap.has(msg.playerNumber)) {
        const randomColor = mafiaColors[Math.floor(Math.random() * mafiaColors.length)];
        colorMap.set(msg.playerNumber, randomColor);
      }
    });
    return colorMap;
  }, [messages]);

  const getPlayerImage = (msg, isOwnMessage) => {
    const isMafiaSharingEnabled = currentPlayer.role === 'MAFIA' && msg.role === 'MAFIA';
    
    if (isOwnMessage || isMafiaSharingEnabled) {
      const playerRole = roles.find(role => role.name === (isOwnMessage ? currentPlayer.role : msg.role));
      return playerRole ? playerRole.image : "/img/default-avatar.png";
    }
    return "/img/default-avatar.png";
  };

  const getMessageIconClass = (msg) => {
    const isMafia = currentPlayer?.role === 'MAFIA' && msg?.role === 'MAFIA';
    return `message-icon ${isMafia ? 'mafia-icon' : ''}`;
  };

  return (
    <div className="message-list">
      {messages.map((msg, index) => {
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

        return (
          <div key={index} className={`message ${isOwnMessage ? "own-message" : "other-message"}`}>
            {!isOwnMessage && (
              <>
                <div className="message-icon-container">
                  <div 
                    className={getMessageIconClass(msg)}
                    style={{ 
                      backgroundImage: `url(${getPlayerImage(msg, false)})`,
                      ...(currentPlayer?.role === 'MAFIA' && msg?.role === 'MAFIA' && {
                        backgroundColor: mafiaColorMap.get(msg.playerNumber)
                      })
                    }}
                  >
                    <span className="player-name">{msg.username || `Player ${msg.playerNumber}`}</span>
                  </div>
                </div>
                <div className="message-box">
                  <span className="message-text">{msg.content}</span>
                </div>
              </>
            )}
            
            {isOwnMessage && (
              <>
                <div className="message-box">
                  <span className="message-text">{msg.content}</span>
                </div>
                <div className="message-icon-container">
                  <div 
                    className={getMessageIconClass(msg)}
                    style={{ 
                      backgroundImage: `url(${getPlayerImage(msg, true)})`,
                      ...(currentPlayer?.role === 'MAFIA' && msg?.role === 'MAFIA' && {
                        backgroundColor: mafiaColorMap.get(msg.playerNumber)
                      })
                    }}
                  >
                    <span className="player-name">나</span>
                  </div>
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