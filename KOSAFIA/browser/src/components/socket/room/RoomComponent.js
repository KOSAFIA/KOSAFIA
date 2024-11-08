import React, { useState } from 'react';
import { useRoomContext } from '../../../contexts/socket/room/RoomContext';

const RoomComponent = ({ roomKey }) => {
    const { messages, players, sendMessage, startGame, isConnected } = useRoomContext();
    const [inputMessage, setInputMessage] = useState('');

    const handleSendMessage = () => {
        if (inputMessage.trim()) {
            sendMessage(inputMessage);
            setInputMessage('');
        }
    };

    return (
        <div>
            <h1>방 {roomKey}</h1>
            <div>연결 상태: {isConnected ? '연결됨' : '연결 중...'}</div>
            <h2>사용자들:</h2>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>{player.username}</li>
                ))}
            </ul>
            <h2>채팅:</h2>
            <div style={{ height: '300px', overflowY: 'auto' }}>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.username}:</strong> {msg.content}
                    </div>
                ))}
            </div>
            <div>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                    }}
                    placeholder="메시지를 입력하세요"
                />
                <button onClick={handleSendMessage}>보내기</button>
                <button onClick={startGame} disabled={!isConnected}>
                    게임 시작
                </button>
            </div>
        </div>
    );
};

export default RoomComponent;
