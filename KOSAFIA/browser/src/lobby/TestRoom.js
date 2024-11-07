import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { RoomProvider } from '../contexts/socket/room/RoomContext'; // RoomProvider 경로에 맞게 수정
import RoomComponent from '../components/socket/room/RoomComponent'; // RoomComponent 경로에 맞게 수정

function TestRoom() {
    const { roomKey } = useParams();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]); // 빈 배열로 초기화

    useEffect(() => {
        const fetchRoomData = async () => {
            if (!roomKey) {
                console.error("roomKey가 정의되지 않았습니다.");
                return;
            }
            try {
                const response = await axios.get(`http://localhost:8080/api/rooms/${roomKey}`);
                sessionStorage.setItem("roomKey", roomKey);
                setUsers(response.data.users || []); // 응답이 없으면 빈 배열 설정
            } catch (error) {
                console.error('방 정보를 가져오는 중 오류 발생:', error);
                alert('방 정보를 가져오는 데 실패했습니다.');
            }
        };

        fetchRoomData();
    }, [roomKey]);

    const handleStartGame = async () => {
        if (!roomKey) {
            console.error("roomKey가 정의되지 않았습니다. 게임을 시작할 수 없습니다.");
            return;
        }
        try {
            const response = await axios.post(`http://localhost:8080/api/rooms/${roomKey}/start`);
            alert(response.data);
            navigate(`/rooms/${roomKey}/gameplay`, { state: { users, roomKey } });
        } catch (error) {
            console.error('게임 시작 중 오류 발생:', error);
            alert('게임을 시작하는 데 실패했습니다.');
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>게임 방</h1>
            <h2>참여자 목록:</h2>
            {Array.isArray(users) && users.length > 0 ? (
                <ul>
                    {users.map((user) => (
                        <li key={user.id || user.username}>{user.username}</li>
                    ))}
                </ul>
            ) : (
                <p>현재 참여자가 없습니다.</p>
            )}
            <button onClick={handleStartGame}>게임 시작</button>
        </div>
    );
}

export default TestRoom;