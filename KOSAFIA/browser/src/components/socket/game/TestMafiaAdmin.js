import React, { useState } from 'react';
import { useGameContext } from '../../../contexts/socket/game/GameSocketContext';
import axios from 'axios';

const TestMafiaAdmin = () => {
    const { players } = useGameContext();
    const [selectedPlayerId, setSelectedPlayerId] = useState('');
    const [selectedRole, setSelectedRole] = useState('CITIZEN');
    const [selectedGameStatus, setSelectedGameStatus] = useState('DAY');

    // 게임 상태 변경
    const handleGameStatusChange = async () => {
        try {
            await axios.post('http://localhost:8080/api/game/admin/status', {
                gameStatus: selectedGameStatus
            }, { withCredentials: true });
            console.log('게임 상태가 변경되었습니다:', selectedGameStatus);
        } catch (error) {
            console.error('게임 상태 변경 실패:', error);
        }
    };

    // 플레이어 생존 상태 변경
    const handlePlayerAliveChange = async () => {
        try {
            await axios.post('http://localhost:8080/api/game/admin/player/alive', {
                playerId: selectedPlayerId,
                isAlive: false
            }, { withCredentials: true });
            console.log('플레이어 생존 상태가 변경되었습니다');
        } catch (error) {
            console.error('플레이어 상태 변경 실패:', error);
        }
    };

    // 플레이어 역할 변경
    const handlePlayerRoleChange = async () => {
        try {
            await axios.post('http://localhost:8080/api/game/admin/player/role', {
                playerId: selectedPlayerId,
                role: selectedRole
            }, { withCredentials: true });
            console.log('플레이어 역할이 변경되었습니다:', selectedRole);
        } catch (error) {
            console.error('플레이어 역할 변경 실패:', error);
        }
    };

    return (
        <div className="admin-panel" style={{ padding: '20px', border: '1px solid red' }}>
            <h2>관리자 테스트 패널</h2>

            {/* 게임 상태 변경 섹션 */}
            <div style={{ marginBottom: '20px' }}>
                <h3>게임 상태 변경</h3>
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
                <button onClick={handleGameStatusChange}>상태 변경</button>
            </div>

            {/* 플레이어 선택 섹션 */}
            <div style={{ marginBottom: '20px' }}>
                <h3>플레이어 선택</h3>
                <select 
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                >
                    <option value="">플레이어 선택</option>
                    {players.map(player => (
                        <option key={player.id} value={player.id}>
                            {player.username} (ID: {player.id})
                        </option>
                    ))}
                </select>
            </div>

            {/* 플레이어 상태 변경 섹션 */}
            <div style={{ marginBottom: '20px' }}>
                <h3>플레이어 생존 상태 변경</h3>
                <button 
                    onClick={handlePlayerAliveChange}
                    disabled={!selectedPlayerId}
                >
                    사망 처리
                </button>
            </div>

            {/* 플레이어 역할 변경 섹션 */}
            <div style={{ marginBottom: '20px' }}>
                <h3>플레이어 역할 변경</h3>
                <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                >
                    <option value="CITIZEN">CITIZEN</option>
                    <option value="POLICE">POLICE</option>
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="MAFIA">MAFIA</option>
                </select>
                <button 
                    onClick={handlePlayerRoleChange}
                    disabled={!selectedPlayerId}
                >
                    역할 변경
                </button>
            </div>
        </div>
    );
};

export default TestMafiaAdmin; 