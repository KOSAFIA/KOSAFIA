// hooks/useRoomSocket.js
import { useState, useEffect, useCallback } from 'react';

export const useRoomSocket = (stompClient, roomId) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const subscribeToRoom = useCallback(() => {
    if (!stompClient || !roomId) return { chatUnsub: null, usersUnsub: null };

    const chatSubscription = stompClient.subscribe(
      `/topic/room.${roomId}`,
      (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages(prev => [...prev, newMessage]);
      }
    );

    const usersSubscription = stompClient.subscribe(
      `/topic/room.${roomId}.users`,
      (message) => {
        const response = JSON.parse(message.body);
        setUsers(response.users);
      }
    );

    return {
      chatUnsub: () => chatSubscription.unsubscribe(),
      usersUnsub: () => usersSubscription.unsubscribe()
    };
  }, [stompClient, roomId]);

  const sendMessage = useCallback((content) => {
    if (!stompClient || !stompClient.connected || !roomId) return;

    stompClient.publish({
      destination: '/fromapp/room.chat',
      body: JSON.stringify({
        type: 'CHAT',
        roomId,
        userId: sessionStorage.getItem('userId'),
        username: sessionStorage.getItem('username'),
        content
      })
    });
  }, [stompClient, roomId]);

  const enterRoom = useCallback(() => {
    if (!stompClient || !stompClient.connected || !roomId) return;

    stompClient.publish({
      destination: '/fromapp/room.enter',
      body: JSON.stringify({
        type: 'ENTER',
        roomId,
        userId: sessionStorage.getItem('userId'),
        username: sessionStorage.getItem('username')
      })
    });
  }, [stompClient, roomId]);

  const leaveRoom = useCallback(() => {
    if (!stompClient || !stompClient.connected || !roomId) return;

    stompClient.publish({
      destination: '/fromapp/room.leave',
      body: JSON.stringify({
        type: 'LEAVE',
        roomId,
        userId: sessionStorage.getItem('userId'),
        username: sessionStorage.getItem('username')
      })
    });
  }, [stompClient, roomId]);

  return {
    messages,
    users,
    sendMessage,
    enterRoom,
    leaveRoom,
    subscribeToRoom
  };
};