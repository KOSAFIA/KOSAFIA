import React from 'react';
import { useGameStart } from '../../../contexts/socket/room/GameStartContext';

const GameStartButton = () => {
    const { startGame } = useGameStart();

    return (
        <button onClick={startGame}>Start Game</button>
    );
};

export default GameStartButton;