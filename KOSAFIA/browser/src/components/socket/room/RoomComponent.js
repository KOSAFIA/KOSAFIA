import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 올바른 위치에서 임포트
import { useRoomContext } from '../../../contexts/socket/room/RoomContext';
import axios from 'axios';
import '../../../lobby/TestRoom.css';



const RoomComponent = ({ roomKey }) => {
    const { isHost, setIsHost, messages, players, sendMessage, startGame, isConnected } = useRoomContext();
    const [inputMessage, setInputMessage] = useState('');
    const navigate = useNavigate();
 




    // 방 정보 상태
    const [roomName, setRoomName] = useState('테스트');
    const [maxPlayers, setMaxPlayers] = useState(8);

    // 방 정보를 서버에서 가져오는 함수
    useEffect(() => {
        const fetchRoomInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/rooms/${roomKey}`);
                const roomData = response.data;

                // 방 제목과 최대 인원 설정
                setRoomName(roomData.roomName || '테스트');
                setMaxPlayers(roomData.maxPlayers || 8);
            } catch (error) {
                console.error('방 정보를 가져오는 데 실패했습니다:', error);
                alert('방 정보를 가져올 수 없습니다.');
            }
        };

        fetchRoomInfo();
    }, [roomKey]);


    useEffect(() => {
        const checkIfHost = async () => {
            try {
                const player = JSON.parse(sessionStorage.getItem('player')); // 현재 플레이어 정보 가져오기
                if (!player || !player.username) {
                    console.error('플레이어 정보를 찾을 수 없습니다.');
                    return;
                }

                // 서버에 방장 여부 확인 요청
                const response = await axios.post(
                    `http://localhost:8080/api/game/host/${roomKey}`,
                    { username: player.username }, // 요청 바디에 username 전달
                    { withCredentials: true } // 인증 정보 포함
                );

                console.log(response.data);

                // 방장 여부를 상태에 저장
                setIsHost(response.data); // 서버 응답에 따라 isHost 업데이트
            } catch (error) {
                console.error('방장 여부 확인 중 오류:', error);
            }
        };

        checkIfHost();
    }, [roomKey, setIsHost]);


    const handleSendMessage = () => {
        if (inputMessage.trim()) {
            sendMessage(inputMessage);
            setInputMessage('');
        }
    };

const handleLeaveRoom = async () => {
    try {
        const player = JSON.parse(sessionStorage.getItem('player'));
        if (!player) {
            console.error('플레이어 정보를 찾을 수 없어요!');
            return;
        }

        await axios.post(`http://localhost:8080/api/rooms/${roomKey}/leave`, {}, {
            withCredentials: true,
        });

        sessionStorage.removeItem('player');
        sessionStorage.removeItem('roomKey');

        navigate('/TestLobby');
    } catch (error) {
        console.error('방 나가기 실패:', error);
        alert('방을 나가는데 실패했습니다. 다시 시도해 주세요.');
    }
};
   

    return (
        <div className="room-container">
            <div className="room-header">
                <div className="room-title">{roomKey}. {roomName}</div>
                <div className="room-button-group">
                {isHost && (
                    <button
                        className="room-button-start"
                        onClick={startGame}
                        disabled={!isConnected}
                    >
                        게임 시작
                    </button>    
                )}              
                <button 
                    className="room-button-exit"
                    onClick={handleLeaveRoom} >나가기</button>
                </div>
            </div>

            <div className="room-main-content">
                {/* 채팅 영역 */}
                <div className="room-chat-section">
                    <div className="room-chat-log">
                        {messages.map((msg, index) => {
                            const player = JSON.parse(sessionStorage.getItem('player'));
                            const currentUsername = player ? player.username : null;

                            return (
                                <div key={index} className="chat-wrapper">
                                    {msg.username !== currentUsername && (
                                        <div className="chat-username">{msg.username}</div> /* 닉네임을 바깥에 표시   */
                                    )}
                                    <div
                                        className={`chat-message ${
                                            msg.username === currentUsername ? 'my-message' : 'other-message'
                                        }`}
                                    >
                                        <div className="chat-content">{msg.content}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>    

                    <div className="room-chat-input">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSendMessage();
                            }}
                            placeholder="메시지를 입력하세요"
                        />
                        <button className="send-button" onClick={handleSendMessage}>
                            
                        </button>
                    </div>
                </div>

                {/* 플레이어 영역 */}
                <div className="room-player-section">
                    <div className="room-user-count">
                        {players.filter((player) => player.username).length} / {maxPlayers}
                    </div>
                    <div className="room-player-grid">
                        {Array.from({ length: maxPlayers  }).map((_, index) => {
                            const player = players[index] || {};
                            return (
                                <div className={`room-player-card ${player.username ? '' : 'empty'}`} key={index}>
                                {player.username ? (
                                    <>
                                        <div className="room-player-number">{index + 1}</div>
                                        <div className="room-player-number">{player.playerNumber}</div>
                                        <div className="room-player-icon">?</div> {/* 사용자 아이콘 */}
                                        <div className="room-player-name">{player.username}</div>
                                    </>
                                ) : (
                                    <div className="room-player-icon"></div> 
                                )}
                            </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomComponent;
