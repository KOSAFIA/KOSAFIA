// ChatBox.js
import React, { useState, forwardRef, useImperativeHandle } from "react";
import "../styles/components/ChatBox.css";
import SendButton from "./SendButton";
import MessageList from "./MessageList"; 

const ChatBox = forwardRef(({ stageIndex }, ref) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  
  // 하드 코딩된 currentPlayer 변수 지정
  const currentPlayer = "Player5";

  useImperativeHandle(ref, () => ({
    receiveMessage: (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    },
  }));

  const handleSendMessage = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { player: currentPlayer, text: input }]);
    setInput("");
  };

  const isNightStage = stageIndex === 4;

  return (
    <div className="chat-box">
      {isNightStage && (
        <img src="/img/light.png" alt="Night Effect" className="night-image" />
      )}
      <MessageList messages={messages} currentPlayer={currentPlayer} />
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <SendButton onClick={handleSendMessage} />
      </div>
    </div>
  );
});

export default ChatBox;
