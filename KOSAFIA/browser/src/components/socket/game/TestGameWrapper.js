import React, { useState } from 'react';
import { useGameContext } from '../../../contexts/socket/game/GameSocketContext';
import GameSocketComponent from './GameSocketComponent';

const TestControls = () => {
    const { 
        players, 
        gameStatus,
        updateGameStatus,
        updatePlayerStatus
    } = useGameContext();

    const [selectedGameStatus, setSelectedGameStatus] = useState(gameStatus);
    const [selectedPlayerId, setSelectedPlayerId] = useState('');
    const [selectedRole, setSelectedRole] = useState('CITIZEN');
    const [selectedIsAlive, setSelectedIsAlive] = useState(true);

    const handleApplyChanges = async () => {
        try {
            console.log('변경사항 적용 시작');
            
            // 게임 상태 변경
            if (selectedGameStatus !== gameStatus) {
                console.log('게임 상태 변경 시도:', selectedGameStatus);
                await updateGameStatus(selectedGameStatus);
            }

            // 플레이어 상태 변경
            if (selectedPlayerId) {
                console.log('플레이어 상태 변경 시도:', {
                    playerNumber: selectedPlayerId,
                    isAlive: selectedIsAlive,
                    role: selectedRole
                });
                
                await updatePlayerStatus(parseInt(selectedPlayerId), {
                    isAlive: selectedIsAlive,
                    role: selectedRole
                });
            }

            console.log('변경사항 적용 완료');
        } catch (error) {
            console.error('변경사항 적용 중 오류:', error);
            alert('변경사항 적용 실패');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            padding: '15px',
            background: '#f8f9fa',
            border: '2px solid #dc3545',
            borderRadius: '8px',
            zIndex: 1000
        }}>
            <h3>🔧 테스트 컨트롤</h3>
            
            {/* 게임 상태 변경 */}
            <div style={{ marginBottom: '10px' }}>
                <label>게임 상태:</label>
                <select 
                    value={selectedGameStatus}
                    onChange={(e) => setSelectedGameStatus(e.target.value)}
                >
                    <option value="DAY">DAY</option>
                    <option value="NIGHT">NIGHT</option>
                    <option value="DELAY">DELAY</option>
                    <option value="VOTE">VOTE</option>
                    <option value="FINAL_VOTE">FINAL_VOTE</option>
                </select>
            </div>

            {/* 플레이어 선택 */}
            <div style={{ marginBottom: '10px' }}>
                <label>플레이어:</label>
                <select
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                >
                    <option value="">선택하세요</option>
                    {players.map(player => (
                        <option key={player.playerNumber} value={player.playerNumber}>
                            {player.username} ({player.role || '역할없음'})
                        </option>
                    ))}
                </select>
            </div>

            {/* 생존 상태 */}
            <div style={{ marginBottom: '10px' }}>
                <label>생존 상태:</label>
                <select
                    value={selectedIsAlive.toString()}
                    onChange={(e) => setSelectedIsAlive(e.target.value === 'true')}
                >
                    <option value="true">생존</option>
                    <option value="false">사망</option>
                </select>
            </div>

            {/* 역할 선택 */}
            <div style={{ marginBottom: '10px' }}>
                <label>역할:</label>
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                >
                    <option value="CITIZEN">CITIZEN</option>
                    <option value="POLICE">POLICE</option>
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="MAFIA">MAFIA</option>
                </select>
            </div>

            <button 
                onClick={handleApplyChanges}
                style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                변경사항 적용
            </button>
        </div>
    );
};

const TestGameWrapper = () => {
    return (
        <div style={{ 
            position: 'relative',
            width: '100%',
            height: '100%'
        }}>
            <TestControls />
            <GameSocketComponent />
        </div>
    );
};

export default TestGameWrapper; 