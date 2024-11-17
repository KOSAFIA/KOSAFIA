import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 올바른 위치에서 임포트
import { useRoomContext } from '../../../contexts/socket/room/RoomContext';
import axios from 'axios';
import '../../../lobby/TestRoom.css';



const RoomComponent = ({ roomKey }) => {
    const { messages, players, sendMessage, startGame, isConnected } = useRoomContext();
    const [inputMessage, setInputMessage] = useState('');
    const navigate = useNavigate();

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
   
z
    return (
        <div className="room-container">
            <div className="room-header">
                <div className="room-title">{roomKey}. {}</div>
                <div className="room-button-group">
                    <button
                        className="room-button-start"
                        onClick={startGame}
                        disabled={!isConnected}
                    >
                        게임 시작
                    </button>                  
                    <button 
                        className="room-button-exit"
                        onClick={handleLeaveRoom} >나가기</button>
                </div>
            </div>

            <div className="room-main-content">
                {/* 채팅 영역 */}
                <div className="room-chat-section">
                    <div className="room-chat-log">
                        {messages.map((msg, index) => (
                            <p key={index}>
                                <strong>{msg.username}:</strong> {msg.content}
                            </p>
                        ))}
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
                        <button className="room-send-button" onClick={handleSendMessage}>
                            ▶
                        </button>
                    </div>
                </div>

                {/* 플레이어 영역 */}
                <div className="room-player-section">
                    <div className="room-user-count">
                        {players.filter((player) => player.username).length} / 8
                    </div>
                    <div className="room-player-grid">
                        {Array.from({ length: 8 }).map((_, index) => {
                            const player = players[index] || {};
                            return (
                                <div className={`room-player-card ${player.username ? '' : 'empty'}`} key={index}>
                                {player.username ? (
                                    <>
                                        <div className="room-player-number">{index + 1}</div>
                                        <div className="room-player-number">{player.playerNumber}</div>
                                        <div className="room-player-icon">👤</div> {/* 사용자 아이콘 */}
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
