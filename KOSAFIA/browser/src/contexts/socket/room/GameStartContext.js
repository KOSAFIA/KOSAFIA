import React, { createContext, useContext } from 'react';
import useStompClient from '../../../hooks/socket/UseStompClient';

const GameStartContext = createContext();

export const GameStartProvider = ({ roomId, children }) => {
    const stompClient = useStompClient();

    const startGame = () => {
        const startMessage = { roomId, message: 'Game Start' };
        stompClient.send(`/app/room.game.start/${roomId}`, {}, JSON.stringify(startMessage));
    };

    return (
        <GameStartContext.Provider value={{ startGame }}>
            {children}
        </GameStartContext.Provider>
    );
};

export const useGameStart = () => useContext(GameStartContext);