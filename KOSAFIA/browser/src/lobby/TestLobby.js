import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TestLobby() {
    const navigate = useNavigate();
    const roomKey = 1; // 테스트용으로 roomKey를 임의로 설정
    console.log("roomKey:", roomKey); // roomKey 값을 확인하는 로그
    const handleJoinRoom = async () => {
    // 수정된 버전
    try {
        const response = await axios.post(`http://localhost:8080/api/rooms/${roomKey}/join`, {}, {
        withCredentials: true
    });
    
    // axios는 2xx 응답을 자동으로 처리합니다
    console.log('방 입장 성공:', response.data);
    sessionStorage.setItem("player", JSON.stringify(response.data));
    navigate(`/rooms/${roomKey}`); // 성공시 바로 이동
    } catch (error) {
        if (error.response) {
            if (error.response.status === 409) {
            // 이미 방에 있는 경우
                navigate(`/rooms/${roomKey}`);
            } else {
                alert(`방 입장 실패: ${error.response.data}`);
            }
        } else {
            alert('서버 연결 오류');
        }
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