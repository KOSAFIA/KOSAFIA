import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RoomProvider } from '../contexts/socket/room/RoomContext';
import RoomComponent from '../components/socket/room/RoomComponent';

function TestRoom() {
    const { roomKey } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // 필요한 모든 데이터 확인
        const userData = sessionStorage.getItem('userData');
        const player = sessionStorage.getItem('player');
        const storedRoomKey = sessionStorage.getItem('roomKey');

        if (!userData || !player || !storedRoomKey) {
            console.error('필요한 정보가 없습니다. 로비로 이동합니다.');
            navigate('/TestLobby');
            return;
        }

        // URL의 roomKey와 저장된 roomKey가 일치하는지 확인
        if (storedRoomKey !== roomKey) {
            console.error('잘못된 방 접근입니다. 로비로 이동합니다.');
            navigate('/TestLobby');
            return;
        }

        // 컴포넌트 언마운트 시 정리
        return () => {
            console.log('TestRoom 컴포넌트 언마운트');
        };
    }, [navigate, roomKey]);

    // 방 나가기 함수
    const handleLeaveRoom = async () => {
        try {


            const player = JSON.parse(sessionStorage.getItem('player'));
            if (!player) {
                console.error('플레이어 정보를 찾을 수 없어요!');
                return;
            }

            // 서버에 방 나가기 요청
            await axios.post(`http://localhost:8080/api/rooms/${roomKey}/leave`, {}, {
                withCredentials: true
            });

            // 세션 스토리지에서 플레이어 정보 및 방 키 삭제
            sessionStorage.removeItem('player');
            sessionStorage.removeItem('roomKey');

            // 로비로 이동
            navigate('/TestLobby');
        } catch (error) {
            console.error('방 나가기 실패:', error);
            alert('방을 나가는데 실패했습니다. 다시 시도해 주세요.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <RoomProvider roomKey={roomKey}>
                <RoomComponent roomKey={roomKey} />
            </RoomProvider>
            <button onClick={handleLeaveRoom} style={{ marginTop: '20px' }}>
                방 나가기
            </button>
        </div>
    );
}

export default TestRoom;