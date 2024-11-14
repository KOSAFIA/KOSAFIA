import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameSocketProvider } from '../contexts/socket/game/GameSocketContext';
import TestGameWrapper from '../components/socket/game/TestGameWrapper';

function TestPlayRoom() {
    const { roomKey } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSocketReady, setIsSocketReady] = useState(false);

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

                // 이전 소켓 연결이 완전히 정리될 때까지 더 오래 대기
                await new Promise(resolve => setTimeout(resolve, 2000));
                setIsSocketReady(true);
                setIsLoading(false);
            } catch (error) {
                console.error('세션 검증 중 오류:', error);
                navigate('/TestLobby');
            }
        };

        validateSession();
    }, [roomKey, navigate]);

    if (isLoading) {
        return <div>이전 연결 정리 중...</div>;
    }

    return (
        <div style={{ padding: '20px'}}>
            <h1>게임 진행 창 - 방 {roomKey}</h1>
            {isSocketReady && (
                <GameSocketProvider roomKey={parseInt(roomKey)}>
                    <TestGameWrapper />
                </GameSocketProvider>
            )}
        </div>
    );
}

export default TestPlayRoom;