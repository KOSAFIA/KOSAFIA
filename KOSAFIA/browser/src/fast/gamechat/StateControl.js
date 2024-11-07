import React from 'react';

const StateControl = ({
  gameState,
  setGameState,
  isAlive,
  setIsAlive,
  sessionId,  // 추가
  playerId,    // 추가
  finalVoteTarget,          // 추가
  setFinalVoteTarget,       // 추가
  stompClient  // 추가: stompClient 전달
}) => {
  const gameStates = ['DAY', 'NIGHT', 'VOTE', 'FINAL_VOTE'];

  const handleGameStateChange = async (newState) => {
    try {
      const response = await fetch('/api/game/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          newState
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update game state');
      }

      setGameState(newState);
      // VOTE나 FINAL_VOTE가 아닐 때는 최종 투표 대상자 초기화
      if (newState !== 'VOTE' && newState !== 'FINAL_VOTE') {
        setFinalVoteTarget(null);
      }
    } catch (error) {
      console.error('Error updating game state:', error);
    }
  };

  const handleAliveStateChange = async (newAliveState) => {
    try {
      const response = await fetch('/api/game/player/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          playerId,
          isAlive: newAliveState
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update player state');
      }

      setIsAlive(newAliveState);
    } catch (error) {
      console.error('Error updating player state:', error);
    }
  };
  // 최후변론자 설정 핸들러 수정
  const handleSetFinalVoteTarget = async () => {
    try {
      // 1. 먼저 최후변론자로 자신을 설정
      const finalVoteResponse = await fetch('/api/game/finalvote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          targetId: playerId
        })
      });

      if (!finalVoteResponse.ok) {
        throw new Error('최후변론자 설정에 실패했습니다.');
      }

      // 2. 게임 상태를 최후변론으로 변경
      const stateResponse = await fetch('/api/game/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          newState: 'FINAL_VOTE'
        })
      });

      if (!stateResponse.ok) {
        throw new Error('게임 상태 변경에 실패했습니다.');
      }

      setFinalVoteTarget(playerId);
      setGameState('FINAL_VOTE');
      
      // STOMP를 통해 시스템 메시지 전송 (백엔드에서 처리)
      stompClient?.send(`/fromapp/room.${sessionId}`, {}, JSON.stringify({
        type: 'SYSTEM',
        content: `${playerId}님이 최후변론자가 되었습니다.`,
        timestamp: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };
  return (
    <div className="mb-4 bg-white rounded-lg p-4 shadow">
      <h2 className="text-xl font-bold mb-4">게임 상태 제어</h2>
      
      <div className="space-y-4">
        {/* 게임 상태 변경 */}
        <div>
          <h3 className="font-medium mb-2">게임 상태</h3>
          <div className="flex flex-wrap gap-2">
            {gameStates.map((state) => (
              <button
                key={state}
                onClick={() =>  handleGameStateChange(state)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  gameState === state
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 hover:bg-blue-200'
                }`}
              >
                {state === 'NIGHT' && '🌙 밤'}
                {state === 'DAY' && '☀️ 낮'}
                {state === 'VOTE' && '🗳️ 투표'}
                {state === 'FINAL_VOTE' && '⚖️ 처형투표'}
              </button>
            ))}
          </div>
        </div>

        {/* 생존 상태 변경 */}
        <div>
          <h3 className="font-medium mb-2">생존 상태</h3>
          <button
            onClick={() =>  handleAliveStateChange(!isAlive)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isAlive
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {isAlive ? '👤 생존' : '💀 사망'}
          </button>
        </div>
        
        <div>
        <h3 className="font-medium mb-2">최후변론</h3>
        <button
          onClick={handleSetFinalVoteTarget}
          disabled={!isAlive || gameState === 'FINAL_VOTE'}  // 사망자나 이미 최후변론 중일 때는 비활성화
          className={`px-4 py-2 rounded-lg transition-colors ${
            finalVoteTarget === playerId
              ? 'bg-purple-500 text-white cursor-not-allowed'  // 자신이 최후변론자일 때
              : gameState === 'FINAL_VOTE'
                ? 'bg-gray-300 cursor-not-allowed'  // 다른 사람의 최후변론 중일 때
                : !isAlive
                  ? 'bg-gray-300 cursor-not-allowed'  // 사망 상태일 때
                  : 'bg-purple-100 hover:bg-purple-200'  // 활성화 상태
          }`}
        >
          {finalVoteTarget === playerId 
            ? '📢 최후변론 중...' 
            : gameState === 'FINAL_VOTE'
              ? '📢 다른 참가자의 최후변론 중...'
              : '📢 최후변론자 되기'}
        </button>
      </div>
      </div>
    </div>
  );
};

export default StateControl;