import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameSocketProvider } from '../contexts/socket/game/GameSocketContext';
import TestGameWrapper from '../components/socket/game/TestGameWrapper';

function TestPlayRoom() {
    const { roomKey } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateSession = async () => {
            try {
                const playerData = sessionStorage.getItem('player');
                const storedRoomKey = sessionStorage.getItem('roomKey');

                if (!playerData || !storedRoomKey || storedRoomKey !== roomKey) {
                    console.error('세션 검증 실패');
                    navigate('/TestLobby');
                    return;
                }

                setIsLoading(false);
            } catch (error) {
                console.error('세션 검증 중 오류:', error);
                navigate('/TestLobby');
            }
        };

        validateSession();
    }, [roomKey, navigate]);

    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>게임 진행 창 - 방 {roomKey}</h1>
            <GameSocketProvider roomKey={roomKey}>
                <TestGameWrapper />
            </GameSocketProvider>
        </div>
    );
}

export default TestPlayRoom;