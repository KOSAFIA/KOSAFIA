import React, { useState, useEffect } from 'react';
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
    const [rooms, setRooms] = useState([]); // 방 목록 상태 추가

    const fetchRooms = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/rooms/all');
            console.log("방 목록 조회 성공 - 응답 데이터:", response.data);

            // rooms가 객체로 올 경우 배열로 변환
            const roomsArray = Array.isArray(response.data) ? response.data : Object.values(response.data);
            setRooms(roomsArray);
        } catch (error) {
            console.error("방 목록 조회 실패 - 오류:", error);
        }
    };

    useEffect(() => {
        fetchRooms(); // 컴포넌트 마운트 시 방 목록 가져오기
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRoomDetails((prevDetails) => ({
            ...prevDetails,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleCreateRoom = async () => {
        console.log("방 생성 버튼 클릭됨");
        console.log("전송할 roomDetails:", roomDetails);

        try {
            const response = await axios.post('http://localhost:8080/api/rooms/create', 
                { 
                    roomName: roomDetails.roomName, 
                    maxPlayers: Number(roomDetails.maxPlayers), 
                    isPrivate: Boolean(roomDetails.isPrivate), 
                    password: roomDetails.password 
                }, 
                { withCredentials: true }
            );
            console.log("방 생성 성공 - 응답 데이터:", response.data);

            const { player, roomKey } = response.data; 
            
            if (player) {
                console.log("플레이어 정보 저장:", player);
                sessionStorage.setItem("player", JSON.stringify(player));
                sessionStorage.setItem("roomKey", roomKey);
                navigate(`/rooms/${roomKey}`);
            }
            // 방 생성 후 목록 갱신
            fetchRooms();
        } catch (error) {
            console.error("방 생성 실패 - 오류:", error);
            alert("방 생성에 실패했습니다. 다시 시도해 주세요.");
        }
    };

    // 방 입장 처리 함수 추가
    const handleJoinRoom = async (roomKey) => {
        try {
            console.log(`방 ${roomKey} 입장 시도`);
            const response = await axios.post(
                `http://localhost:8080/api/rooms/${roomKey}/join`,
                {},
                { withCredentials: true }
            );

            if (response.data) {
                console.log('방 입장 성공:', response.data);
                // 플레이어 정보와 roomKey 저장
                sessionStorage.setItem('player', JSON.stringify(response.data.player));
                sessionStorage.setItem('roomKey', response.data.roomKey);
                navigate(`/rooms/${roomKey}`);
            }
        } catch (error) {
            handleJoinError(error);
        }
    };

    // 에러 처리 함수
    const handleJoinError = (error) => {
        console.error('방 입장 중 에러 발생:', error);
        
        if (error.response) {
            const errorMessage = error.response.data.error || '알 수 없는 오류가 발생했습니다.';
            
            switch (error.response.status) {
                case 401:
                    alert('로그인이 필요합니다.');
                    navigate('/');
                    break;
                case 404:
                    alert('존재하지 않는 방입니다.');
                    fetchRooms(); // 방 목록 새로고침
                    break;
                case 409:
                    alert('방이 가득 찼거나 게임이 진행 중입니다.');
                    fetchRooms(); // 방 목록 새로고침
                    break;
                default:
                    alert(errorMessage);
            }
        } else if (error.request) {
            alert('서버에 연결할 수 없습니다.');
        } else {
            alert('방 입장 중 오류가 발생했습니다.');
        }
    };

    return (
        <div>
            <h1>로비 페이지</h1>
            <button onClick={() => setIsModalOpen(true)}>방 생성</button>

            {/* 방 목록 표시 */}
            <h2>생성된 방 목록</h2>
            <ul>
                {rooms.map((room) => (
                    <li key={room.roomKey}>
                        <strong>{room.roomName}</strong> 
                        ({room.players?.length || 0}/{room.maxPlayers}명)
                        {room.isPrivate && <span> 🔒</span>}
                        <button 
                            onClick={() => handleJoinRoom(room.roomKey)}
                            disabled={
                                room.players?.length >= room.maxPlayers || 
                                room.gameStatus !== 'NONE'
                            }
                        >
                            {room.players?.length >= room.maxPlayers ? '만원' : 
                             room.gameStatus !== 'NONE' ? '게임중' : '입장'}
                        </button>
                    </li>
                ))}
            </ul>

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
                    min="1"
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

