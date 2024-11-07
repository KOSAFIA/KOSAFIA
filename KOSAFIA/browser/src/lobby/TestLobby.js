import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TestLobby() {
    const navigate = useNavigate();
    const roomKey = 1; // 테스트용으로 roomKey를 임의로 설정
    console.log("roomKey:", roomKey); // roomKey 값을 확인하는 로그
    const handleJoinRoom = async () => {
        try {
            // const response = await axios.post(`http://localhost:8080/api/rooms/${roomKey}/join`); // 백틱(`) 사용하여 템플릿 리터럴로 작성
            const response = await axios.post(`http://localhost:8080/api/rooms/${roomKey}/join`, {}, {
                withCredentials: true // 세션 쿠키를 포함하여 요청을 보냄
            });
            
            if(response.ok){
                sessionStorage.setItem("player", JSON.stringify(response.data));
                alert(response.data); // 성공 시 서버로부터의 메시지 표시
                navigate(`/rooms/${roomKey}`); // 입장 성공 시 해당 방 페이지로 이동
            }
            else{
                alert(response.status); //응답 메시지 상태 알림창
            }

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