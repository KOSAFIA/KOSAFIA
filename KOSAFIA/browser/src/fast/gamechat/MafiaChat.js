// MafiaChat.js
import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

const MafiaChat = ({
  roomId,
  userId,
  username,
  gameState,
  userRole,
  isAlive,
  finalVoteTarget,
  stompClient
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  // 채팅 메시지 구독
  useEffect(() => {
    if (stompClient) {
      // 일반 채팅 구독
      const chatSub = stompClient.subscribe(`/topic/room.${roomId}`, (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          console.log('Received chat message:', newMessage);
          setMessages(prev => [...prev, newMessage]);
        } catch (e) {
          console.error('Error processing chat message:', e);
        }
      });

      // 마피아 채팅 구독
      let mafiaSub = null;
      if (userRole === 'MAFIA') {
        mafiaSub = stompClient.subscribe(`/topic/room.${roomId}.mafia`, (message) => {
          try {
            const newMessage = JSON.parse(message.body);
            console.log('Received mafia message:', newMessage);
            setMessages(prev => [...prev, newMessage]);
          } catch (e) {
            console.error('Error processing mafia message:', e);
          }
        });
      }

      // 채팅 히스토리 요청
      stompClient.send(`/fromapp/room.${roomId}.history`, {}, 
        JSON.stringify({ sessionId: roomId })
      );

      // Cleanup
      return () => {
        chatSub.unsubscribe();
        if (mafiaSub) {
          mafiaSub.unsubscribe();
        }
      };
    }
  }, [stompClient, roomId, userRole]);

  // 스크롤 자동화
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !stompClient) return;

    const messageData = {
      type: gameState === 'NIGHT' && userRole === 'MAFIA' ? 'MAFIA' : 'NORMAL',
      sender: username,
      content: inputMessage,
      role: userRole,
      timestamp: new Date().toISOString()
    };

    const destination = gameState === 'NIGHT' && userRole === 'MAFIA'
      ? `/fromapp/room.${roomId}.mafia`
      : `/fromapp/room.${roomId}`;

    console.log('Sending message:', messageData, 'to:', destination);
    
    stompClient.send(destination, {}, JSON.stringify(messageData));
    setInputMessage('');
  };

    // 채팅 가능 여부 확인
    const canSendMessage = () => {
      if (!isAlive) return false;
  
      switch (gameState) {
        case 'VOTE':
          return false;  // 투표 시간에는 모두 채팅 불가
          
        case 'FINAL_VOTE':
          // 최후 변론 대상자만 채팅 가능
          return userId === finalVoteTarget;
          
        case 'NIGHT':
          // 밤에는 마피아만 채팅 가능
          return userRole === 'MAFIA';
          
        case 'DAY':
          return true;  // 낮에는 생존자 모두 채팅 가능
          
        default:
          return false;
      }
    };

  // 채팅 제한 메시지 표시
  const getChatRestrictMessage = () => {
    if (!isAlive) return "사망한 플레이어는 채팅에 참여할 수 없습니다.";
    
    switch (gameState) {
      case 'VOTE':
        return "투표 진행 중입니다.";
      case 'FINAL_VOTE':
        return userId === finalVoteTarget 
          ? "최후 변론을 시작하세요."
          : "최후 변론 시간입니다.";
      case 'NIGHT':
        return "밤에는 마피아만 채팅이 가능합니다.";
      default:
        return "";
    }
  };    
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* ... 채팅 메시지 표시 영역 ... */}

      <div className="p-4 border-t">
        {!canSendMessage() ? (
          <div className="text-center text-yellow-500">
            {getChatRestrictMessage()}
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 p-2 border rounded"
              placeholder={
                gameState === 'FINAL_VOTE' 
                  ? "최후 변론을 입력하세요..."
                  : "메시지를 입력하세요..."
              }
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MafiaChat;