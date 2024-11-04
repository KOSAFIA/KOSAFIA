import React, { useState } from 'react';
import MafiaGameRoom from './MafiaGameRoom';

const GameStart = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameConfig, setGameConfig] = useState(null);
  
  const handleStartGame = async (event) => { 
    // event.preventDefault();
    const formData = new FormData(event.target);
    // 값들을 직접 확인
    const sessionId = formData.get('sessionId');
    const playerId = formData.get('playerId');
    const playerRole = formData.get('playerRole');

    console.log('Joining game with:', { sessionId, playerId, playerRole }); // 디버깅용

    try {
      const response = await fetch('/api/game/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,    // formValues에서 직접 값을 사용
          playerId: playerId,
          role: playerRole
        })
      });

      if (!response.ok) {
        throw new Error('Failed to join game');
      }

      const gameSession = await response.json();

            // 세션 정보 설정
      const config = {
        sessionId: sessionId,
        playerId: playerId,
        playerRole: playerRole,
        ...gameSession
      };

      console.log('Game session created:', config); // 디버깅용
      setGameConfig(config);
      setGameStarted(true);

      
    } catch (error) {
      alert('게임 참여 중 오류가 발생했습니다: ' + error.message);
    }
  };

  if (gameStarted && gameConfig) {
    return <MafiaGameRoom config={gameConfig} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">마피아 게임 입장</h1>
        
        <form onSubmit={handleStartGame}>
          {/* 플레이어 ID 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">플레이어 ID</label>
            <input
              type="text"
              name="playerId"
              required
              className="w-full p-2 border rounded"
              placeholder="player123"
            />
          </div>

          {/* 세션 키 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">세션 키</label>
            <input
              type="text"
              name="sessionId"
              required
              className="w-full p-2 border rounded"
              placeholder="session123"
            />
          </div>

          {/* 게임 역할 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">게임 역할</label>
            <select
              name="playerRole"
              required
              className="w-full p-2 border rounded"
            >
              <option value="CITIZEN">시민</option>
              <option value="MAFIA">마피아</option>
              <option value="DOCTOR">의사</option>
              <option value="POLICE">경찰</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            게임 입장
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameStart;