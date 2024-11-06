import React from 'react';
import { useLocation } from 'react-router-dom';

function TestPlayRoom() {
    const location = useLocation();
    const { users, roomId } = location.state || {}; // 이전 페이지에서 전달된 상태

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>게임 진행 창</h1>
            <p>방 번호: {roomId}</p>
            <h2>참여자 목록:</h2>
            <ul>
                {users && users.map((user) => (
                    <li key={user.id}>{user.username}</li>
                ))}
            </ul>
        </div>
    );
}

export default TestPlayRoom;