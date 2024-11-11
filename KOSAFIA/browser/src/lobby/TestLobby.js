// import React, { useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// function TestLobby() {
//     const navigate = useNavigate();
//     const roomKey = 1; // 테스트용으로 roomKey를 임의로 설정
//     console.log("roomKey:", roomKey); // roomKey 값을 확인하는 로그
//     const handleJoinRoom = async () => {
//     // 수정된 버전
//     try {
//         const response = await axios.post(`http://localhost:8080/api/rooms/${roomKey}/join`, {}, {
//         withCredentials: true
//     });
    
//     // axios는 2xx 응답을 자동으로 처리합니다
//     console.log('방 입장 성공:', response.data);
//     sessionStorage.setItem("player", JSON.stringify(response.data));
//     navigate(`/rooms/${roomKey}`); // 성공시 바로 이동
//     } catch (error) {
//         if (error.response) {
//             if (error.response.status === 409) {
//             // 이미 방에 있는 경우
//                 navigate(`/rooms/${roomKey}`);
//             } else {
//                 alert(`방 입장 실패: ${error.response.data}`);
//             }
//         } else {
//             alert('서버 연결 오류');
//         }
//         }
//     };

//     return (
//         <div style={{ padding: '20px', textAlign: 'center' }}>
//             <h1>Lobby</h1>
//             <button onClick={handleJoinRoom}>입장</button>
//         </div>
//     );
// }

// export default TestLobby;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

function TestLobby() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomDetails, setRoomDetails] = useState({
        roomName: "",
        maxPlayers: 8,
        isPrivate: false,
        password: ""
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRoomDetails((prevDetails) => ({
            ...prevDetails,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleCreateRoom = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/rooms/create', roomDetails, {
                withCredentials: true
            });
            const { player, roomKey } = response.data; 
            
            if (player) {
                sessionStorage.setItem("player", JSON.stringify(player));
                sessionStorage.setItem("roomKey", roomKey);
                navigate(`/rooms/${roomKey}`);
            }
        } catch (error) {
            console.error("방 생성 실패:", error);
            alert("방 생성에 실패했습니다. 다시 시도해 주세요.");
        }
    };

    return (
        <div>
            <h1>로비 페이지</h1>
            <button onClick={() => setIsModalOpen(true)}>방 생성</button>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="방 생성"
            >
                <h2>방 생성</h2>
                <input
                    type="text"
                    name="roomName"
                    placeholder="방 제목"
                    value={roomDetails.roomName}
                    onChange={handleInputChange}
                />
                <input
                    type="number"
                    name="maxPlayers"
                    placeholder="최대 인원"
                    value={roomDetails.maxPlayers}
                    onChange={handleInputChange}
                    min="2"
                    max="12"
                />
                <label>
                    비밀방 여부:
                    <input
                        type="checkbox"
                        name="isPrivate"
                        checked={roomDetails.isPrivate}
                        onChange={handleInputChange}
                    />
                </label>
                {roomDetails.isPrivate && (
                    <input
                        type="password"
                        name="password"
                        placeholder="비밀번호"
                        value={roomDetails.password}
                        onChange={handleInputChange}
                    />
                )}
                <button onClick={handleCreateRoom}>방 생성</button>
                <button onClick={() => setIsModalOpen(false)}>취소</button>
            </Modal>
        </div>
    );

}

export default TestLobby;