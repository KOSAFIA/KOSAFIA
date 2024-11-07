import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useNavigate import

function TestLobby() {
    const navigate = useNavigate(); // useNavigate 훅 사용

    //김남영 추가 :: 세션에서 사용자 데이터 가져오기 무조건 한번 페이지 로드시 실행
    // 컴포넌트가 마운트될 때 세션 데이터를 가져옵니다
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // withCredentials: true를 설정하여 쿠키와 함께 요청을 보냅니다
                const response = await axios.get('http://localhost:8080/api/user/response-userData', {
                    withCredentials: true
                });
                
                // 응답으로 받은 userData를 sessionStorage에 저장
                sessionStorage.setItem('userData', JSON.stringify(response.data));
                console.log('사용자 데이터를 성공적으로 저장했어요:', response.data);
            } catch (error) {
                console.error('사용자 데이터를 가져오는데 실패했어요:', error);
            }
        };

        fetchUserData();
    }, [navigate]);

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