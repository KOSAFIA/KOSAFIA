import React, { useState } from 'react';
import { useGameContext } from '../../../contexts/socket/game/GameSocketContext';

const GameSocketComponent = () => {
    const { 
        messages, 
        players, 
        gameStatus, 
        currentPlayer,
        mafiaTarget,
        canChat,
        sendGameMessage,
        setTarget,
        isConnected 
    } = useGameContext();
    
    const [inputMessage, setInputMessage] = useState('');

    const handleSendMessage = () => {
        if (inputMessage.trim() && canChat()) {
            sendGameMessage(inputMessage);
            setInputMessage('');
        }
    };

    const handleTargetSelection = (targetId) => {
        if (currentPlayer?.role === 'MAFIA' && gameStatus === 'NIGHT') {
            setTarget(targetId);
        }
    };

    return (
        <div className="game-container">
            <div className="game-status">
                <h2>게임 상태: {gameStatus}</h2>
                <p>당신의 역할: {currentPlayer?.role || '미정'}</p>
            </div>

            <div className="players-list">
                <h3>플레이어 목록:</h3>
                <ul>
                    {players.map((player) => (
                        <li key={player.playerNumber}>
                            {player.username}
                            {currentPlayer?.role === 'MAFIA' && gameStatus === 'NIGHT' && (
                                <input
                                    type="radio"
                                    name="mafiaTarget"
                                    checked={mafiaTarget === player.playerNumber}
                                    onChange={() => handleTargetSelection(player.playerNumber)}
                                    disabled={player.playerNumber === currentPlayer.playerNumber}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="chat-container">
                <div className="chat-messages" style={{ height: '300px', overflowY: 'auto' }}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <strong>{msg.username}:</strong> {msg.content}
                        </div>
                    ))}
                </div>

                <div className="chat-input">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendMessage();
                        }}
                        placeholder={canChat() ? "메시지를 입력하세요" : "현재 채팅할 수 없습니다"}
                        disabled={!canChat()}
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!canChat() || !isConnected}
                    >
                        보내기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameSocketComponent;
