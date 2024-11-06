import React from 'react';
import { useGameStart } from './GameStartContext';

const GameStartButton = () => {
    const { startGame } = useGameStart();

    return (
        <button onClick={startGame}>Start Game</button>
    );
};

export default GameStartButton;