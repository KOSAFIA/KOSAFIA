// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams, useNavigate } from 'react-router-dom';
// import { RoomProvider } from '../contexts/socket/room/RoomContext'; // RoomProvider 경로에 맞게 수정
// import RoomComponent from '../components/socket/room/RoomComponent'; // RoomComponent 경로에 맞게 수정

// function TestRoom() {
//     const { roomId } = useParams(); // URL에서 roomId를 받아옴
//     const navigate = useNavigate();
//     const [users, setUsers] = useState([]);

//     // 서버에서 방 정보 가져오기
//     useEffect(() => {
//         const fetchRoomData = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:8080/api/rooms/${roomId}`);
//                 setUsers(response.data.users); // 서버 응답 데이터 중 유저 리스트만 저장
//             } catch (error) {
//                 console.error('방 정보를 가져오는 중 오류 발생:', error);
//                 alert('방 정보를 가져오는 데 실패했습니다.');
//             }
//         };

//         fetchRoomData();
//     }, [roomId]);

//     // 게임 시작 버튼 클릭 시 실행할 함수
//     const handleStartGame = async () => {
//         try {
//             const response = await axios.post(`http://localhost:8080/api/rooms/${roomId}/start`);
//             alert(response.data); // 서버의 성공 메시지 표시
//             navigate(`/rooms/${roomId}/gameplay`, { state: { users, roomId } }); // 유저 정보와 방 번호 전달
//         } catch (error) {
//             console.error('게임 시작 중 오류 발생:', error);
//             alert('게임을 시작하는 데 실패했습니다.');
//         }
//     };

//     return (
//         <div style={{ padding: '20px', textAlign: 'center' }}>
//             <h1>게임 방</h1>
//             <h2>참여자 목록:</h2>
//             <ul>
//                 {users.map((user) => (
//                     <li key={user.id}>{user.username}</li>
//                 ))}
//             </ul>
//             <button onClick={handleStartGame}>게임 시작</button>

//             {/* RoomComponent 추가 */}
//             <RoomProvider roomId={roomId}>
//                 <RoomComponent roomId={roomId} />
//             </RoomProvider>
//         </div>
//     );
// }

// export default TestRoom;

import React , {useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoomProvider } from '../contexts/socket/room/RoomContext'; // RoomProvider 경로에 맞게 수정
import RoomComponent from '../components/socket/room/RoomComponent'; // RoomComponent 경로에 맞게 수정

function TestRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    // 컴포넌트 마운트 시 userData 확인
    useEffect(() => {
        const userData = sessionStorage.getItem('userData');
        if (!userData) {
            console.error('사용자 정보를 찾을 수 없어요!');
            navigate('/custom-login');  // 로그인 페이지로 리다이렉트
            return;
        }
    }, [navigate]);

    return (
        <div style={{ padding: '20px' }}>
            <RoomProvider roomId={roomId}>
                <RoomComponent roomId={roomId} />
            </RoomProvider>
        </div>
    );
}

export default TestRoom;