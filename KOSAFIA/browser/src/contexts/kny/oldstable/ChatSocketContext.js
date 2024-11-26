// src/contexts/ChatSocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";

const ChatSocketContext = createContext();

// src/contexts/KNY/ChatSocketContext.js
export const ChatSocketProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false); // 연결 상태 추가
  const baseUrl = process.env.REACT_APP_API_URL;
  console.log("Current user state:", user); // 디버깅용

  useEffect(() => {
    let ws = null;

    // user가 있고 userId가 있을 때만 연결
    if (user && user.userId && socket === null) {
      console.log("User authenticated, attempting WebSocket connection");

      try {
        // ws = new WebSocket('ws://localhost:8080/ws/chat');
        const wsUrl = baseUrl.replace(/^http/, "ws") + "/ws/chat"; // http -> ws로 변경하여 WebSocket 연결

        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          console.log("WebSocket Connected");
          setIsConnected(true);
          // JOIN 메시지 전송
          const joinMessage = {
            type: "JOIN",
            username: user.username,
            // userId: user.userId.toString()  // 문자열로 변환
            userId: user.userId,
          };
          ws.send(JSON.stringify(joinMessage));
        };

        ws.onclose = (event) => {
          console.log("WebSocket Closed:", event.code, event.reason);
          setIsConnected(false);

          setSocket(null);

          // // 자동 재연결 시도
          // setTimeout(() => {
          //     console.log("Attempting to reconnect...");
          //     setSocket(null);  // socket 상태 초기화
          // }, 5000);
        };

        ws.onerror = (error) => {
          console.error("WebSocket Error:", error);
          setIsConnected(false);
        };

        // ws.onmessage = (event) => {
        //     console.log('Received message:', event.data);
        //     try {
        //         const message = JSON.parse(event.data);
        //         setMessages(prev => [...prev, message]);
        //     } catch (e) {
        //         console.error('Error parsing message:', e);
        //     }
        // };

        setSocket(ws);
      } catch (error) {
        console.error("Error creating WebSocket:", error);
        setIsConnected(false);
        setSocket(null);
      }
    }

    //clean up
    return () => {
      if (ws) {
        ws.close();
        setIsConnected(false);
        setSocket(null);
      }
    };
    // }, [user, socket]);  // socket 의존성 추가
    // }, [user]);
  }, [user, socket, baseUrl]); // baseUrl도 의존성에 추가

  const sendMessage = (content) => {
    if (socket && socket.readyState === WebSocket.OPEN && user) {
      try {
        const messageData = {
          type: "CHAT",
          username: user.username,
          userId: user.userId.toString(), // 문자열로 변환
          content: content,
          timestamp: new Date().toISOString(),
        };
        socket.send(JSON.stringify(messageData));
        return true;
      } catch (e) {
        console.error("Error sending message:", e);
        return false;
      }
    } else {
      console.warn(
        "Cannot send message. Socket state:",
        socket ? socket.readyState : "no socket"
      );
      return false;
    }
  };

  return (
    <ChatSocketContext.Provider
      value={{
        messages,
        sendMessage,
        isConnected, // 연결 상태 제공
      }}
    >
      {children}
    </ChatSocketContext.Provider>
  );
};
export const useChatSocket = () => {
  const context = useContext(ChatSocketContext);
  if (!context) {
    throw new Error("useChatSocket must be used within a ChatSocketProvider");
  }
  return context;
};
