import { RoomChat } from "../../socket/room/RoomChat";
import { RoomProvider } from "../../../contexts/socket/room/RoomContext";
import { useBase } from "../../../contexts/socket/base/BaseContext";
import React, { useState, useEffect } from "react";
import RoomUserList from "../../socket/room/RoomUserList";



export const RoomSocketComponent = ({ roomId }) => {
    const { connected, connect, disconnect } = useBase();
    const [stompClient, setStompClient] = useState(null);
  
    useEffect(() => {
      const client = connect();
      setStompClient(client);
  
      return () => {
        disconnect(client);
      };
    }, []);
  
    if (!connected) {
      return <div>Connecting...</div>;
    }
  
    return (
      <RoomProvider roomId={roomId} stompClient={stompClient}>
        <div className="room-container">
          <RoomUserList />
          <RoomChat />
        </div>
      </RoomProvider>
    );
  };