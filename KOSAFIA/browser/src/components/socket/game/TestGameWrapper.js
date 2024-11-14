import React, { useState } from 'react';
import { useGameContext } from '../../../contexts/socket/game/GameSocketContext';
import GameSocketComponent from './GameSocketComponent';

// 게임 상태별 간단한 테마 색상
const GAME_THEMES = {
    DAY: '#E6F3FF',      // 하늘색 배경
    NIGHT: '#1A0000',    // 어두운 붉은 배경
    VOTE: '#E6E6FA',     // 연보라색 배경
    FINAL_VOTE: '#F5F5F5', // 회색 배경
    DELAY: '#FFFFFF'     // 흰색 배경
};

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
                
                await updatePlayerStatus(selectedPlayerId, {
                    isAlive: selectedIsAlive,
                    role: selectedRole
                });
            }

            console.log('변경사항 적용 완료');
        } catch (error) {
            console.error('변경사항 적용 중 오류:', error);
            alert('변경사항 적용 실패: ' + error.message);
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
                    <option value="FINALVOTE">FINALVOTE</option>
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
    const { gameStatus } = useGameContext();

    // 현재 게임 상태에 따른 배경색 설정
    const backgroundColor = GAME_THEMES[gameStatus] || GAME_THEMES.DAY;

    return (
        <div style={{ 
            padding: '20px',
            backgroundColor,
            minHeight: '100vh',
            transition: 'background-color 0.5s ease' // 부드러운 색상 전환
        }}>
            <TestControls />
            <GameSocketComponent />
        </div>
    );
};

export default TestGameWrapper; 