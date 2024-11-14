import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../../contexts/socket/game/GameSocketContext';
import GameSocketComponent from './GameSocketComponent';

// 게임 상태별 간단한 테마 색상
const GAME_THEMES = {
    DAY: '#E6F3FF',      // 하늘색 배경
    NIGHT: '#FFE6E6',    // 연한빨강
    VOTE: '#E6E6FA',     // 연보라색 배경
    FINAL_VOTE: '#F5F5F5', // 회색 배경
    DELAY: '#FFFFFF'     // 흰색 배경
};

const TestControls = () => {
    const { 
        players, 
        gameStatus,
        updateGameStatus,
        currentPlayer,    // 현재 플레이어 정보 추가
        isHost,           // 방장 여부 확인 추가
        voteStatus,       // 투표 상태 추가
        processVoteResult, // 투표 결과 처리 함수 추가
        requestFinalVoteResult // 최종 투표 결과 처리 요청 함수 추가
    } = useGameContext();

    const handleNextPhase = async () => {
        if (!isHost) return;

        try {
            switch(gameStatus) {
                case 'FINALVOTE':
                    // 최종 투표 결과 처리 요청
                    await requestFinalVoteResult();
                    break;
                case 'DAY':
                    await updateGameStatus('VOTE');
                    break;
                case 'VOTE':
                    const voteResult = await processVoteResult(voteStatus);
                    if (voteResult.success) {
                        await updateGameStatus('FINALVOTE');
                    }
                    break;
                case 'NIGHT':
                    await updateGameStatus('DAY');
                    break;
                default:
                    await updateGameStatus('NIGHT');
            }
        } catch (error) {
            console.error('게임 상태 전환 실패:', error);
        }
    };

    // 방장이 아니면 컨트롤 패널 숨기기
    if (!isHost) return null;

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
                    value={gameStatus}
                    onChange={(e) => updateGameStatus(e.target.value)}
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
                    value={currentPlayer.playerNumber}
                    onChange={(e) => updateGameStatus(e.target.value)}
                >
                    <option value="">선택하세요</option>
                    {players.map(player => (
                        <option key={player.playerNumber} value={player.playerNumber}>
                            {player.username} ({player.role || '역할없음'})
                        </option>
                    ))}
                </select>
            </div>

            <button 
                onClick={handleNextPhase}
                style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Next Phase ({gameStatus})
            </button>
        </div>
    );
};

const TestGameWrapper = () => {
    const { gameStatus } = useGameContext();

    // gameStatus가 제대로 전달되는지 확인
    useEffect(() => {
        console.log('게임 상태 변경:', gameStatus);
    }, [gameStatus]);

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