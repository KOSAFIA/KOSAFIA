import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useNavigate import

function TestLobby() {
    const navigate = useNavigate(); // useNavigate 훅 사용

    const handleJoinRoom = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/rooms/1/join'); // 서버의 엔드포인트 주소
            alert(response.data); // 성공 시 서버로부터의 메시지 표시
            navigate(`/rooms/1`); // 입장 성공 시 게임 방 페이지로 이동
        } catch (error) {
            console.error('Error joining room:', error);
            alert('방 입장에 실패했습니다. 다시 시도해 주세요.');
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Lobby</h1>
            <button onClick={handleJoinRoom}>입장</button>
        </div>
    );
}

export default TestLobby;