// ChatBox.js
import React, { useState, forwardRef, useImperativeHandle } from "react";
import "../styles/components/ChatBox.css";
import SendButton from "./SendButton";
import MessageList from "./MessageList";

const ChatBox = forwardRef(({ 
  stageIndex,
  messages: contextMessages, // GameSocketContext에서 받은 메시지들
  canChat, // 채팅 가능 여부
  onSendMessage, // 메시지 전송 함수 gameroom->
  currentPlayer // 현재 플레이어 정보
}, ref) => {
  const [localMessages, setLocalMessages] = useState([]);
  const [input, setInput] = useState("");

  useImperativeHandle(ref, () => ({
    receiveMessage: (message) => {
      const formattedMessage = {
        content: typeof message === 'string' ? message : message.content,
        playerNumber: message.playerNumber || 0, // 시스템 메시지는 0
        role: message.role || 'SYSTEM',
        username: message.username,
        isSystemMessage: message.isSystemMessage || false,
        isMafiaChat: message.isMafiaChat || false
      };
      setLocalMessages(prev => [...prev, formattedMessage]);
    },
  }));

  const handleSendMessage = () => {
    if (!canChat || input.trim() === "") return;
    
    const message = {
      content: input.trim(),
      username: currentPlayer.username,
      playerNumber: currentPlayer.playerNumber,
      role: currentPlayer.role,
      isMafiaChat: currentPlayer.role === 'MAFIA' && stageIndex === 0
    };

    onSendMessage(message.content, message.isMafiaChat);
    setInput("");
  };


  const formatMessages = (messages) => {
    if (!messages) return [];
    
    return messages.filter(msg => {
      if (msg.isSystemMessage) return true;
      
      if (stageIndex === 0) { // 밤 시간
        if (currentPlayer.role !== 'MAFIA') {
          return false;
        }
        if (!msg.isMafiaChat) {
          return false;
        }
      }
      return true;
    });
  };

  return (
    <div className="chat-box">
      {stageIndex === 0 && (
        <img src="/img/light.png" alt="Night Effect" className="night-image" />
      )}
      <MessageList 
        messages={formatMessages(contextMessages || localMessages)}
        currentPlayer={currentPlayer}
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