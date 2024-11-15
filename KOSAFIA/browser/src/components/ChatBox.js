// ChatBox.js
import React, { useState, forwardRef, useImperativeHandle } from "react";
import "../styles/components/ChatBox.css";
import SendButton from "./SendButton";
import MessageList from "./MessageList";

const ChatBox = forwardRef(({ 
  stageIndex,
  messages: contextMessages, // GameSocketContext에서 받은 메시지들
  canChat, // 채팅 가능 여부
  onSendMessage, // 메시지 전송 함수
  currentPlayer // 현재 플레이어 정보
}, ref) => {
  const [localMessages, setLocalMessages] = useState([]);
  const [input, setInput] = useState("");

  // ref를 통한 메시지 수신 기능 유지
  useImperativeHandle(ref, () => ({
    receiveMessage: (message) => {
      const formattedMessage = {
        text: message.content,
        player: message.username,
        isTimeModifiedMessage: message.isSystemMessage,
        isMafiaChat: message.isMafiaChat
      };
      setLocalMessages(prev => [...prev, formattedMessage]);
    },
  }));

  const handleSendMessage = () => {
    if (!canChat || input.trim() === "") return;
    
    const message = {
      content: input.trim(),
      username: currentPlayer?.username,
      role: currentPlayer?.role,
      isMafiaChat: currentPlayer?.role === 'MAFIA' && stageIndex === 1
    };

    onSendMessage(message.content, message.isMafiaChat);
    setInput("");
  };

  const formatMessages = (messages) => {
    if (!messages) return [];
    
    return messages.map(msg => ({
      text: msg.content,
      player: msg.username || msg.role || 'Unknown',
      isTimeModifiedMessage: msg.isSystemMessage,
      isMafiaChat: msg.isMafiaChat
    })).filter(msg => {
      // 밤 시간에 마피아가 아닌 플레이어는 채팅을 볼 수 없음
      if (stageIndex === 1) {
        if (currentPlayer?.role !== 'MAFIA') {
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
      {stageIndex === 1 && (
        <img src="/img/light.png" alt="Night Effect" className="night-image" />
      )}
      <MessageList 
        messages={formatMessages(contextMessages || localMessages)}
        currentPlayer={currentPlayer?.username}
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
