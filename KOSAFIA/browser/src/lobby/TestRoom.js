// -----백 구현------
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


//-----프론트 구현-----
// import React from 'react';
// import './TestRoom.css';

// const TestRoom = () => {
//     const players = [
//         { id: 1, name: '지여님다' },
//         { id: 2, name: '유저2' },
//         { id: 3, name: '유저3' },
//         { id: 4, name: '유저4' },
//         {}, {}, {}, {}, // 빈 플레이어 자리들
//       ];

//     return (
//         <div className="room-container">
//         <div className="room-header">
//           {/* 왼쪽에 제목 위치 */}
//           <div className="room-title">59.테스트</div>
          
//           {/* 오른쪽에 버튼 그룹 */}
//           <div className="room-button-group">
//             <button className="room-button-start">게임 시작</button>
//             <button className="room-button-exit">나가기</button>
//           </div>
//         </div>
    
//           <div className="main-content">
//         {/* 채팅 영역 */}
//         <div className="chat-section">
//           <div className="chat-log">
//             <p>지여님님께서 입장하셨습니다</p>
//           </div>
//           <div className="chat-input">
//             <input type="text" placeholder="메시지를 입력하세요" />
//             <button className="send-button">▶</button>
//           </div>
//         </div>
    
//             {/* 오른쪽: 플레이어 리스트 */}
//              <div className="player-section">
//           <div className="user-count">{players.filter(player => player.name).length} / 8</div>
//           <div className="player-grid">
//             {players.map((player, index) => (
//               <div className={`player-card ${player.name ? '' : 'empty'}`} key={index}>
//                 {player.name && (
//                   <div className="player-number" >{index + 1}</div> /* 번호 표시 */
//                 )}
//                 <div className="player-icon">?</div>
//                 {player.name && <div className="player-name">{player.name}</div>}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//         </div>
//       );
//     };

// export default TestRoom;


// TestRoom.js
// import React, { useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { RoomProvider, useRoomContext } from '../contexts/socket/room/RoomContext';
// import RoomComponent from '../components/socket/room/RoomComponent';
// import './TestRoom.css';

// const TestRoomContent = (roomKey, navigate ) => {
//     const { players, messages, sendMessage, startGame } = useRoomContext();

//     const handleLeaveRoom = async () => {
//         try {
//             const player = JSON.parse(sessionStorage.getItem('player'));
//             if (!player) {
//                 console.error('플레이어 정보를 찾을 수 없어요!');
//                 return;
//             }

//             await axios.post(`http://localhost:8080/api/rooms/${roomKey}/leave`, {}, {
//                 withCredentials: true
//             });

//             sessionStorage.removeItem('player');
//             sessionStorage.removeItem('roomKey');
//             navigate('/TestLobby');
//         } catch (error) {
//             console.error('방 나가기 실패:', error);
//             alert('방을 나가는데 실패했습니다. 다시 시도해 주세요.');
//         }
//     };

//     return (
//         <div style={{ padding: '20px' }}>
//             <RoomComponent roomKey={roomKey} />
//             <button onClick={handleLeaveRoom} style={{ marginTop: '20px' }}>
//                 방 나가기
//             </button>
//         </div>
//     );
// };

// const TestRoom = () => {
//     const { roomKey } = useParams();
//     const { players, messages, startGame, sendMessage } = useRoomContext();
//     const navigate = useNavigate();

//     useEffect(() => {
//         const userData = sessionStorage.getItem('userData');
//         const player = sessionStorage.getItem('player');
//         const storedRoomKey = sessionStorage.getItem('roomKey');

//         if (!userData || !player || !storedRoomKey) {
//             navigate('/TestLobby');
//         } else if (storedRoomKey !== roomKey) {
//             navigate('/TestLobby');
//         }
//     }, [navigate, roomKey]);

//     const handleSendChat = () => {
//         const input = document.getElementById("chatInput");
//         if (input.value.trim() !== "") {
//             sendMessage(input.value.trim());
//             input.value = "";
//         }
//     };

//     return (
//         <div className="room-container">
//             <div className="room-header">
//                 <div className="room-title">방 번호 {roomKey}</div>
//                 <div className="room-button-group">
//                     <button className="room-button-start" onClick={startGame}>게임 시작</button>
//                     <TestRoomContent />
//                 </div>
//             </div>
//             <div className="main-content">
//                 <div className="chat-section">
//                     <div className="chat-log">
//                         {messages.map((msg, index) => (
//                             <p key={index}><strong>{msg.username}</strong>: {msg.content}</p>
//                         ))}
//                     </div>
//                     <div className="chat-input">
//                         <input type="text" id="chatInput" placeholder="메시지를 입력하세요" />
//                         <button className="send-button" onClick={handleSendChat}>▶</button>
//                     </div>
//                 </div>
//                 <div className="player-section">
//                     <div className="user-count">{players.length} / 8</div>
//                     <div className="player-grid">
//                         {players.map((player, index) => (
//                             <div className="player-card" key={index}>
//                                 <div className="player-number">{index + 1}</div>
//                                 <div className="player-icon">?</div>
//                                 <div className="player-name">{player.username}</div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TestRoom;