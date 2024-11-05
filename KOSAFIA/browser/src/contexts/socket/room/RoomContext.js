import React, { createContext, useContext, useEffect } from 'react';
import { useRoomSocket } from '../../../hooks/socket/room/useRoomSocket';

const RoomContext = createContext(null);

export const RoomProvider = ({ children, roomId, stompClient }) => {
  const roomSocketHook = useRoomSocket(stompClient, roomId);
  
  useEffect(() => {
    const { chatUnsub, usersUnsub } = roomSocketHook.subscribeToRoom();
    roomSocketHook.enterRoom();

    return () => {
      roomSocketHook.leaveRoom();
      if (chatUnsub) chatUnsub();
      if (usersUnsub) usersUnsub();
    };
  }, [roomId, stompClient]);

  return (
    <RoomContext.Provider value={roomSocketHook}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};