import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../../contexts/socket/game/GameSocketContext';

const GameSocketComponent = () => {
    const { 
        messages, //채팅할때 필요해
        players, //플레이리스트 동기화
        gameStatus, //게임 상태 동기화
        currentPlayer, //현재 플레이어 상태 동기화
        mafiaTarget, //마피아의 타겟은 동기화
        canChat, //채팅할수 있는지 컨텍스트 동기화
        sendGameMessage,
        setTarget,
        isConnected,
        //투표 변수들...
        voteStatus,
        sendVote,
        canVote,
        canFinalVote,
        sendFinalVote,
        finalVotes,
        isHost,
        processVoteResult,
        requestFinalVoteResult,
        updateGameStatus
    } = useGameContext();
    
    const [inputMessage, setInputMessage] = useState('');

    useEffect(() => {
        if (!isConnected) {
            console.warn('게임쪽 소켓 연결이 끊어졌습니다');
            return;
        }
        console.log('현재 게임 상태:', gameStatus);
        console.log('현재 플레이어:', currentPlayer);
    }, [isConnected, gameStatus, currentPlayer]);

    const handleSendMessage = () => {
        if (inputMessage.trim() && canChat()) {
            sendGameMessage(inputMessage);
            setInputMessage('');
        }
    };

    const handlePlayerSelection = (targetId) => {
        if (gameStatus === 'NIGHT' && currentPlayer?.role === 'MAFIA') {
            setTarget(targetId);
        }
        else if (gameStatus === 'VOTE' && canVote()) {
            sendVote(targetId);
        }
    };

    const canSelect = (targetId) => {
        const isMafiaNight = gameStatus === 'NIGHT' && currentPlayer?.role === 'MAFIA';
        const isVoteTime = gameStatus === 'VOTE' && canVote();
        return (isMafiaNight || isVoteTime) && targetId !== currentPlayer?.playerNumber;
    };

    const isSelected = (playerId) => {
        if (gameStatus === 'NIGHT' && currentPlayer?.role === 'MAFIA') {
            return mafiaTarget === playerId;
        }
        return false;
    };

    // 최종투표 UI 렌더링
    const renderFinalVoteUI = () => {
        const [myVote, setMyVote] = useState(null); // 'agree' 또는 'disagree' 또는 null
        
        if (gameStatus !== 'FINALVOTE') return null;

        if (currentPlayer?.isVoteTarget) {
            return <div>당신은 최종투표 대상자입니다. 최후의 변론을 하세요.</div>;
        }

        const handleVote = async (isAgree) => {
            try {
                // 같은 버튼을 다시 누르면 투표 취소
                if (myVote === (isAgree ? 'agree' : 'disagree')) {
                    setMyVote(null);
                } else {
                    // 다른 버튼을 누르면 투표 변경
                    await sendFinalVote(isAgree);
                    setMyVote(isAgree ? 'agree' : 'disagree');
                }
            } catch (error) {
                console.error('투표 처리 중 오류:', error);
            }
        };

        return (
            <div>
                <h3>최종 투표</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => handleVote(true)}
                        disabled={!canFinalVote()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: myVote === 'agree' ? '#4CAF50' : '#f0f0f0',
                            color: myVote === 'agree' ? 'white' : 'black',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: canFinalVote() ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        찬성 {myVote === 'agree' && '✓'}
                    </button>
                    <button 
                        onClick={() => handleVote(false)}
                        disabled={!canFinalVote()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: myVote === 'disagree' ? '#f44336' : '#f0f0f0',
                            color: myVote === 'disagree' ? 'white' : 'black',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: canFinalVote() ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        반대 {myVote === 'disagree' && '✓'}
                    </button>
                </div>
                {myVote && <p style={{ marginTop: '10px' }}>투표가 완료되었습니다.</p>}
            </div>
        );
    };

    return (
        <div className="game-container">
            <div className="game-status">
                <h2>게임 상태: {gameStatus}</h2>
                <p>당신의 역할: {currentPlayer?.role || '미정'}</p>
            </div>

            <div className="players-list">
                <h3>플레이어 목록:</h3>
                {players.map((player) => (
                    <div 
                        key={player.playerNumber}
                        onClick={() => canSelect(player.playerNumber) && handlePlayerSelection(player.playerNumber)}
                        style={{
                            cursor: canSelect(player.playerNumber) ? 'pointer' : 'default',
                            padding: '10px',
                            margin: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            backgroundColor: isSelected(player.playerNumber) ? '#e6e6e6' : 'yellowgreen',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <span>{player.username}</span>
                        
                        {gameStatus === 'NIGHT' && currentPlayer?.role === 'MAFIA' && (
                            <input
                                type="radio"
                                checked={mafiaTarget === player.playerNumber}
                                onChange={() => handlePlayerSelection(player.playerNumber)}
                                disabled={player.playerNumber === currentPlayer.playerNumber}
                                style={{ marginLeft: '10px' }}
                            />
                        )}
                        
                        {gameStatus === 'VOTE' && (
                            <span style={{ 
                                marginLeft: '10px', 
                                color: 'blue',
                                fontWeight: voteStatus[player.playerNumber] > 0 ? 'bold' : 'normal'
                            }}>
                                {voteStatus[player.playerNumber] || 0}표
                            </span>
                        )}
                        {gameStatus === 'FINALVOTE' && (
                            <span style={{ 
                                marginLeft: '10px', 
                                color: 'blue',
                                fontWeight: player.isVoteTarget ? 'bold' : 'normal'
                            }}>
                                {player.isVoteTarget ? '최종투표대상자' : ''}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="chat-container">
                <div className="chat-messages" style={{ height: '300px', overflowY: 'auto' }}>
                    {messages.map((msg, index) => {
                        if (gameStatus === 'NIGHT') {
                            if (currentPlayer?.role !== 'MAFIA') {
                                console.log('밤 시간: 마피아가 아닌 플레이어는 채팅을 볼 수 없습니다');
                                return null;
                            }
                            if (!msg.isMafiaChat) {
                                console.log('밤 시간: 마피아 채팅만 표시됩니다');
                                return null;
                            }
                        }
                        
                        return (
                            <div key={index} className={`message ${msg.isMafiaChat ? 'mafia-chat' : ''}`}>
                                <strong>{msg.username}:</strong> {msg.content}
                                {msg.isMafiaChat && <span className="mafia-tag">[마피아]</span>}
                            </div>
                        );
                    })}
                </div>

                <style jsx>{`
                    .mafia-chat {
                        color: red;
                        background-color: rgba(255, 0, 0, 0.1);
                    }
                    .mafia-tag {
                        margin-left: 5px;
                        color: red;
                        font-size: 0.8em;
                    }
                `}</style>

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

            {/* {renderFinalVoteUI()} */}
        </div>
    );
};

export default GameSocketComponent;
