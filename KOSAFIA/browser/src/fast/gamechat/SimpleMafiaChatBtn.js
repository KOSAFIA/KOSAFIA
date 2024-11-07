import React from 'react';

const SimpleMafiaChatBtn = () => {
  const gameStates = ['NIGHT', 'DAY', 'VOTE', 'FINAL_VOTE'];
  const roles = ['CITIZEN', 'MAFIA', 'DOCTOR', 'POLICE'];
  const sessionNumbers = ['1', '2', '3', '4', '5']; // 예시 세션 번호들

  const handleGameStateChange = (newState) => {
    // API 호출
    fetch('/api/game/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameState: newState })
    });
  };

  const handleSessionChange = (newSession) => {
    // API 호출
    fetch('/api/game/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionNumber: newSession })
    });
  };

  const handleRoleChange = (newRole) => {
    // API 호출
    fetch('/api/user/role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: newRole })
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">게임 테스트 컨트롤</h2>
      
      {/* 게임 세션 변경 */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">게임 세션 번호</h3>
        <div className="flex flex-wrap gap-2">
          {sessionNumbers.map((session) => (
            <button
              key={session}
              onClick={() => handleSessionChange(session)}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg"
            >
              세션 {session}
            </button>
          ))}
        </div>
      </div>

      {/* 게임 상태 변경 */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">게임 상태 변경</h3>
        <div className="flex flex-wrap gap-2">
          {gameStates.map((state) => (
            <button
              key={state}
              onClick={() => handleGameStateChange(state)}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg"
            >
              {state === 'NIGHT' && '🌙 밤'}
              {state === 'DAY' && '☀️ 낮'}
              {state === 'VOTE' && '🗳️ 투표'}
              {state === 'FINAL_VOTE' && '⚖️ 처형투표'}
            </button>
          ))}
        </div>
      </div>

      {/* 역할 변경 */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">역할 변경</h3>
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className="px-4 py-2 bg-green-100 hover:bg-green-200 rounded-lg"
            >
              {role === 'MAFIA' && '🔪 마피아'}
              {role === 'POLICE' && '👮 경찰'}
              {role === 'DOCTOR' && '💉 의사'}
              {role === 'CITIZEN' && '👤 시민'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleMafiaChatBtn;