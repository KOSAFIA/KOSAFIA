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
  // 디버깅용 로그
  console.log('MessageList props:', {
    messages,
    currentPlayer,
    currentRole
  });

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
        // 시스템 메시지 처리
        if (msg.isSystemMessage) {
          return (
            <div key={index} className="system-message">
              <div className="message-box system">
                <span className="message-text">{msg.content}</span>
              </div>
            </div>
          );
        }

        // 메시지 소유자 판단 수정
        const isOwnMessage = msg.playerNumber === currentPlayer.playerNumber;
        
        // 디버깅용 로그
        console.log('Message check:', {
          messagePlayerNumber: msg.playerNumber,
          currentPlayerNumber: currentPlayer.playerNumber,
          isOwnMessage: isOwnMessage,
          messageContent: msg.content
        });

        return (
          <div key={index} className={`message ${isOwnMessage ? "own-message" : "other-message"}`}>
            {isOwnMessage ? (
              // 내 메시지 (오른쪽 정렬)
              <>
                <div className="message-box">
                  <span className="message-text">{msg.content}</span>
                </div>
                <div className="message-icon-container">
                  <div className="message-icon" style={{ backgroundImage: `url(${getPlayerImage(msg.playerNumber, true, msg)})` }}>
                    {getMafiaOverlay(msg, true)}
                    <span className="player-name">나</span>
                  </div>
                </div>
              </>
            ) : (
              // 상대방 메시지 (왼쪽 정렬)
              <>
                <div className="message-icon-container">
                  <div className="message-icon" style={{ backgroundImage: `url(${getPlayerImage(msg.playerNumber, false, msg)})` }}>
                    {getMafiaOverlay(msg, false)}
                    <span className="player-name">{`Player ${msg.playerNumber}`}</span>
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
