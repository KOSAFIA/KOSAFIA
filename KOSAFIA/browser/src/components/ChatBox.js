import React, { useState, forwardRef, useImperativeHandle } from "react";
import "../styles/components/ChatBox.css";
import SendButton from "./SendButton";
import MessageList from "./MessageList";
import { STATUS_INDEX, GAME_STATUS } from "../constants/GameStatus";

const ChatBox = forwardRef(
  (
    {
      gameStatus, // gameStatus로 stage 상태를 파악
      messages: contextMessages, // GameSocketContext에서 받은 메시지들
      canChat, // 채팅 가능 여부
      onSendMessage, // 메시지 전송 함수
      currentPlayer, // 현재 플레이어 정보
    },
    ref
  ) => {
    const [localMessages, setLocalMessages] = useState([]);
    const [input, setInput] = useState("");

    // ref를 통한 메시지 수신 기능 유지
    useImperativeHandle(ref, () => ({
      receiveMessage: (message) => {
        const formattedMessage = {
          text:
            typeof message === "string"
              ? message
              : message.text || message.content,
          player: message.username || "System",
          isSystemMessage: message.isSystemMessage,
          isMafiaChat: message.isMafiaChat,
        };
        setLocalMessages((prev) => [...prev, formattedMessage]);
      },
    }));

    const handleSendMessage = () => {
      if (!canChat || input.trim() === "") return;

      const stageIndex = STATUS_INDEX[gameStatus]; // 현재 stageIndex를 계산

      const message = {
        content: input.trim(),
        username: currentPlayer?.username,
        role: currentPlayer?.role,
        isMafiaChat:
          currentPlayer?.role === "MAFIA" &&
          stageIndex === STATUS_INDEX[GAME_STATUS.NIGHT],
      };

      onSendMessage(message.content, message.isMafiaChat);
      setInput("");
    };

    const formatMessages = (messages) => {
      if (!messages) return [];

      const stageIndex = STATUS_INDEX[gameStatus]; // 현재 stageIndex를 계산

      return messages
        .map((msg) => ({
          text: msg.content || msg.text,
          player: msg.isSystemMessage
            ? "System"
            : msg.username || msg.role || "Unknown",
          isSystemMessage: msg.isSystemMessage,
          isMafiaChat: msg.isMafiaChat,
        }))
        .filter((msg) => {
          // 시스템 메시지는 항상 표시
          if (msg.isSystemMessage) return true;

          // 기존 필터 로직 유지
          if (stageIndex === STATUS_INDEX[GAME_STATUS.NIGHT]) {
            if (currentPlayer?.role !== "MAFIA") {
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
        {STATUS_INDEX[gameStatus] === STATUS_INDEX[GAME_STATUS.NIGHT] && (
          <img
            src="/img/light.png"
            alt="Night Effect"
            className="night-image"
          />
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
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={
              canChat ? "메시지를 입력하세요..." : "현재 채팅할 수 없습니다"
            }
            disabled={!canChat}
          />
          <SendButton onClick={handleSendMessage} disabled={!canChat} />
        </div>
      </div>
    );
  }
);

ChatBox.displayName = "ChatBox";

export default ChatBox;
