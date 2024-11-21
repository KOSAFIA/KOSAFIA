// ChatBox.js
import React, { useState, forwardRef, useImperativeHandle } from "react";
import "../styles/components/ChatBox.css";
import SendButton from "./SendButton";
import MessageList from "./MessageList";

const ChatBox = forwardRef(({ 
  gameStatus,
  messages = [], 
  canChat = false, 
  onSendMessage,
  currentPlayer
}, ref) => {
  const [localMessages, setLocalMessages] = useState([]);
  const [input, setInput] = useState("");

  // Hook은 조건문 이전에 호출
  useImperativeHandle(ref, () => ({
    receiveMessage: (message) => {
      const formattedMessage = {
        username: message.username || 'SYSTEM',
        content: message.content || message.text,
        gameStatus: message.gameStatus,
        role: message.role,
        roomKey: message.roomKey,
        playerNumber: message.playerNumber,
        isSystemMessage: message.isSystemMessage
      };
      setLocalMessages(prev => [...prev, formattedMessage]);
    },
  }));

  if (!currentPlayer) {
    return <div>Loading...</div>;
  }

  const handleSendMessage = () => {
    if (!canChat || input.trim() === "") return;
    onSendMessage(input.trim(), currentPlayer?.role === 'MAFIA');
    setInput("");
  };

  const filteredMessages = messages.filter(msg => {
    if (!msg) return false;
    
    // 시스템 메시지 허용
    if (msg.isSystemMessage) return true;
    
    // 경찰 전용 메시지는 경찰에게만 표시
    if (msg.username === "POLICE") {
      return currentPlayer?.role === "POLICE";
    }
    
    // 밤에는 마피아 채팅만 표시
    if (gameStatus === 'NIGHT') {
      return currentPlayer?.role === 'MAFIA' && msg.role === 'MAFIA';
    }
    
    return true;
  });

  return (
    <div className="chat-box">
      {gameStatus === 'NIGHT' && (
        <img src="/img/light.png" alt="Night Effect" className="night-image" />
      )}
      <MessageList 
        messages={filteredMessages}
        currentPlayer={currentPlayer}
        currentRole={currentPlayer?.role}
      />
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={canChat ? "메시지를 입력하세요..." : "현재 채팅할 수 없습니다"}
          disabled={!canChat}
        />
        <SendButton 
          onClick={handleSendMessage}
          disabled={!canChat}
        />
      </div>
    </div>
  );
});

ChatBox.displayName = 'ChatBox';

export default ChatBox;
