import React, { useState } from 'react';
import MafiaGameRoom from './MafiaGameRoom';

const GameStart = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameConfig, setGameConfig] = useState(null);
  
  const handleStartGame = async (event) => { 
    event.preventDefault(); // 이 부분이 주석처리되어 있었네요

    const formData = new FormData(event.target);
    const sessionId = formData.get('sessionId');
    const playerId = formData.get('playerId');
    const playerRole = formData.get('playerRole');

    console.log('Attempting to join game with:', { 
      sessionId, 
      playerId, 
      playerRole 
    });

    try {
      // 요청 데이터 로깅
      const requestData = {
        sessionId,
        playerId,
        role: playerRole // 백엔드 DTO와 일치하도록 'role'로 사용
      };
      console.log('Sending request with data:', requestData);

      const response = await fetch('/api/game/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);

      // 에러 응답 처리 개선
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(
          errorData?.message || 
          `Failed to join game (${response.status})`
        );
      }

      const gameSession = await response.json();
      console.log('Received game session:', gameSession);

      // 게임 설정 구성
      const config = {
        sessionId,
        playerId,
        playerRole,
        ...gameSession
      };

      console.log('Final game config:', config);
      setGameConfig(config);
      setGameStarted(true);

    } catch (error) {
      console.error('Game join error:', error);
      alert(`게임 참여 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 게임 시작 조건 체크 강화
  if (gameStarted && gameConfig?.sessionId) {
    return <MafiaGameRoom config={gameConfig} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">마피아 게임 입장</h1>
        
        <form onSubmit={handleStartGame} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">플레이어 ID</label>
            <input
              type="text"
              name="playerId"
              required
              className="w-full p-2 border rounded"
              placeholder="player123"
              minLength="1"
              maxLength="20"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">세션 키</label>
            <input
              type="text"
              name="sessionId"
              required
              className="w-full p-2 border rounded"
              placeholder="session123"
              minLength="1"
              maxLength="20"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">게임 역할</label>
            <select
              name="playerRole"
              required
              className="w-full p-2 border rounded"
              defaultValue="CITIZEN"
            >
              <option value="CITIZEN">시민</option>
              <option value="MAFIA">마피아</option>
              <option value="DOCTOR">의사</option>
              <option value="POLICE">경찰</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            게임 입장
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameStart;