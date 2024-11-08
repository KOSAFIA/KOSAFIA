import React from 'react';
import { useParams } from 'react-router-dom';
import { RoomProvider } from '../contexts/socket/room/RoomContext';
import { GameSocketProvider } from '../contexts/socket/game/GameSocketContext';
import GameSocketComponent from '../components/socket/game/GameSocketComponent';

function TestPlayRoom() {
    const { roomKey } = useParams();

    return (
        <div style={{ padding: '20px' }}>
            <h1>게임 진행 창 - 방 {roomKey}</h1>
            <RoomProvider roomKey={roomKey}>
                <GameSocketProvider roomKey={roomKey}>
                    <GameSocketComponent />
                </GameSocketProvider>
            </RoomProvider>
        </div>
    );
}

export default TestPlayRoom;