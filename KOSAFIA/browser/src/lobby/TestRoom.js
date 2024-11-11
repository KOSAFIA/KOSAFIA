// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams, useNavigate } from 'react-router-dom';
// import { RoomProvider } from '../contexts/socket/room/RoomContext'; // RoomProvider 경로에 맞게 수정
// import RoomComponent from '../components/socket/room/RoomComponent'; // RoomComponent 경로에 맞게 수정

// function TestRoom() {
//     const { roomKey } = useParams();
//     const navigate = useNavigate();
//     const [users, setUsers] = useState([]); // 빈 배열로 초기화

//     useEffect(() => {
//         const fetchRoomData = async () => {
//             if (!roomKey) {
//                 console.error("roomKey가 정의되지 않았습니다.");
//                 return;
//             }
//             try {
//                 const response = await axios.get(`http://localhost:8080/api/rooms/${roomKey}`);
//                 sessionStorage.setItem("roomKey", roomKey);
//                 setUsers(response.data.users || []); // 응답이 없으면 빈 배열 설정
//             } catch (error) {
//                 console.error('방 정보를 가져오는 중 오류 발생:', error);
//                 alert('방 정보를 가져오는 데 실패했습니다.');
//             }
//         };

//         fetchRoomData();
//     }, [roomKey]);

//     const handleStartGame = async () => {
//         if (!roomKey) {
//             console.error("roomKey가 정의되지 않았습니다. 게임을 시작할 수 없습니다.");
//             return;
//         }
//         try {
//             const response = await axios.post(`http://localhost:8080/api/rooms/${roomKey}/start`);
//             alert(response.data);
//             navigate(`/rooms/${roomKey}/gameplay`, { state: { users, roomKey } });
//         } catch (error) {
//             console.error('게임 시작 중 오류 발생:', error);
//             alert('게임을 시작하는 데 실패했습니다.');
//         }
//     };

//     return (
//         <div style={{ padding: '20px', textAlign: 'center' }}>
//             <h1>게임 방</h1>
//             <h2>참여자 목록:</h2>
//             {Array.isArray(users) && users.length > 0 ? (
//                 <ul>
//                     {users.map((user) => (
//                         <li key={user.id || user.username}>{user.username}</li>
//                     ))}
//                 </ul>
//             ) : (
//                 <p>현재 참여자가 없습니다.</p>
//             )}
//             <button onClick={handleStartGame}>게임 시작</button>
//         </div>
//     );
// }

// export default TestRoom;

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RoomProvider } from '../contexts/socket/room/RoomContext';
import RoomComponent from '../components/socket/room/RoomComponent';

function TestRoom() {
    const { roomKey } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // 사용자 데이터 확인
        const userData = sessionStorage.getItem('userData');
        if (!userData) {
            console.error('사용자 정보를 찾을 수 없어요!');
            navigate('/');
            return;
        }
    }, [navigate]);

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

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useNavigate, useLocation } from 'react-router-dom';

// function RoomPage() {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const { roomKey, player } = location.state || {}; // 로비 페이지에서 전달된 상태
//     const [players, setPlayers] = useState([]);

//     // 방에 있는 인원 목록 가져오기
//     useEffect(() => {
//         const fetchPlayers = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:8080/api/rooms/${roomKey}`);
//                 setPlayers(response.data.players || []); // 방에 있는 모든 플레이어 목록 설정
//             } catch (error) {
//                 console.error("방 정보를 가져오는 중 오류 발생:", error);
//                 alert("방 정보를 불러오는 데 실패했습니다.");
//             }
//         };
//         fetchPlayers();
//     }, [roomKey]);

//     // 방 나가기
//     const handleLeaveRoom = async () => {
//         try {
//             await axios.post(`http://localhost:8080/api/rooms/${roomKey}/leave`, {}, { withCredentials: true });
//             alert("방에서 나왔습니다.");
//             navigate("/lobby"); // 로비 페이지로 이동
//         } catch (error) {
//             console.error("방 나가는 중 오류 발생:", error);
//             alert("방을 나가는 데 실패했습니다.");
//         }
//     };

//     return (
//         <div style={{ padding: '20px', textAlign: 'center' }}>
//             <h1>게임 방</h1>
//             <p>방 번호: {roomKey}</p>
//             <h2>현재 참여자 목록:</h2>
//             <ul>
//                 {players.map((p) => (
//                     <li key={p.userEmail}>{p.username}</li>
//                 ))}
//             </ul>
//             <button onClick={handleLeaveRoom}>방 나가기</button>
//         </div>
//     );
// }

// export default RoomPage;