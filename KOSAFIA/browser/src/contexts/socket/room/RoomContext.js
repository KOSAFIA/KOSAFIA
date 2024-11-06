import React, { createContext, useContext } from 'react';
import useRoom from '../../../hooks/socket/useRoom';

const RoomContext = createContext();

export const RoomProvider = ({ roomId, children }) => {
    const room = useRoom(roomId);

    return (
        <RoomContext.Provider value={room}>
            {children}
        </RoomContext.Provider>
    );
};

export const useRoomContext = () => useContext(RoomContext);