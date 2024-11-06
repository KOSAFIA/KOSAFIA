import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import RoomSocketFeatureComponent from '../pages/socketroom/RoomSocketFeatureComponent'; // RoomSocketFeatureComponent 경로에 맞게 수정

function TestRoom() {
    const { roomId } = useParams(); // URL에서 roomId를 받아옴
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);

    // 서버에서 방 정보 가져오기
    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/rooms/${roomId}`);
                setUsers(response.data.users); // 서버 응답 데이터 중 유저 리스트만 저장
            } catch (error) {
                console.error('방 정보를 가져오는 중 오류 발생:', error);
                alert('방 정보를 가져오는 데 실패했습니다.');
            }
        };

        fetchRoomData();
    }, [roomId]);

    // 게임 시작 버튼 클릭 시 실행할 함수
    const handleStartGame = async () => {
        try {
            const response = await axios.post(`http://localhost:8080/api/rooms/${roomId}/start`);
            alert(response.data); // 서버의 성공 메시지 표시
            navigate(`/rooms/${roomId}/gameplay`, { state: { users, roomId } }); // 유저 정보와 방 번호 전달
        } catch (error) {
            console.error('게임 시작 중 오류 발생:', error);
            alert('게임을 시작하는 데 실패했습니다.');
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>게임 방</h1>
            <h2>참여자 목록:</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.username}</li>
                ))}
            </ul>
            <button onClick={handleStartGame}>게임 시작</button>

            {/* RoomSocketFeatureComponent 추가 */}
            <RoomSocketFeatureComponent roomId={roomId} />
        </div>
    );
}

export default TestRoom;