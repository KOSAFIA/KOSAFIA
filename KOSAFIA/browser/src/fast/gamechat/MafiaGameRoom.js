// MafiaGameRoom.js
import React, { useState, useEffect } from 'react';
import StateControl from './StateControl';
import MafiaChat from './MafiaChat';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const MafiaGameRoom = ({ config }) => {
  const [gameState, setGameState] = useState('DAY');
  const [isAlive, setIsAlive] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [finalVoteTarget, setFinalVoteTarget] = useState(null);  // 추가된 상태

  useEffect(() => {
    const socket = new SockJS('/wstomp');
    const client = Stomp.over(socket);
    
    client.connect({}, () => {
      console.log('WebSocket Connected');
      setStompClient(client);

      // 일반 채팅 구독
      client.subscribe(`/topic/room.${config.sessionId}`, (message) => {
        try {
          console.log('Received message:', message.body);
        } catch (e) {
          console.error('Error processing message:', e);
        }
      });

      // 참가자 목록 구독
      client.subscribe(`/topic/room.${config.sessionId}.participants`, (message) => {
        try {
          const newParticipants = JSON.parse(message.body);
          console.log('Received participants:', newParticipants);
          setParticipants(newParticipants);
        } catch (e) {
          console.error('Error processing participants:', e);
        }
      });

      // 게임 상태 구독
      client.subscribe(`/topic/room.${config.sessionId}.state`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('Received game state:', data);
          setGameState(data.gameState);
        } catch (e) {
          console.error('Error processing game state:', e);
        }
      });

      // 초기 참가자 목록 요청
      client.send('/fromapp/room.${config.sessionId}.participants.get', {}, 
        JSON.stringify({ sessionId: config.sessionId })
      );
    });

    return () => {
      if (client.connected) {
        client.disconnect();
      }
    };
  }, [config.sessionId]);

  const ParticipantsList = () => (
    <div className="mb-4 bg-white rounded-lg p-4 shadow">
      <h2 className="text-xl font-bold mb-2">참가자 목록</h2>
      <div className="grid grid-cols-2 gap-4">
        {participants.map((participant) => (
          <div 
            key={participant.playerId} 
            className={`p-2 rounded ${
              participant.isAlive ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <div className="font-medium">{participant.playerId}</div>
            <div className="text-sm text-gray-600">
              {!participant.isAlive && '💀 '}
              {gameState === 'NIGHT' && participant.role === 'MAFIA' && config.playerRole === 'MAFIA' 
                ? '🔪 마피아' 
                : '👤 참가자'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 게임 정보 */}
        <div className="mb-4 bg-white rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-2">게임 정보</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>플레이어 ID: {config.playerId}</div>
            <div>세션 ID: {config.sessionId}</div>
            <div>역할: {config.playerRole}</div>
          </div>
        </div>

        {/* 참가자 목록 */}
        <ParticipantsList />

        {/* 상태 제어 */}
        <StateControl
          gameState={gameState}
          setGameState={setGameState}
          isAlive={isAlive}
          setIsAlive={setIsAlive}
          sessionId={config.sessionId}
          playerId={config.playerId}
          finalVoteTarget={finalVoteTarget}      // 추가
          setFinalVoteTarget={setFinalVoteTarget}// 추가
          stompClient={stompClient}  // 추가: stompClient 전달
        />

        {/* 채팅 */}
        <MafiaChat
          roomId={config.sessionId}
          userId={config.playerId}
          username={config.playerId}
          gameState={gameState}
          userRole={config.playerRole}
          isAlive={isAlive}
          finalVoteTarget={finalVoteTarget}  // 전달
          stompClient={stompClient}
        />
      </div>
    </div>
  );
};

export default MafiaGameRoom;