// components/chat/LobbyChat.js

// 주요 기능:

// 메시지 타입별 다른 UI
// 시간 표시
// 본인 메시지 구분
// 시스템 메시지(입장/퇴장) 처리

// 스타일링 클래스 구조
// .lobby-chat
// └── .chat-message
//     ├── .enter-message
//     ├── .leave-message
//     └── .normal-message
//         ├── .message-user
//         ├── .message-content
//         └── .message-time


// BaseChat을 상속받아 로비 전용 채팅 구현
// 메시지 종류별 렌더링:

// ENTER: 입장 메시지
// LEAVE: 퇴장 메시지
// CHAT: 일반 채팅 메시지

import React from 'react';
import BaseChat from './BaseChat';
import { useLobbyChat } from '../../../hooks/socket/chat/useLobbyChat';

const LobbyChat = () => {
   // 로비 채팅을 위한 상태와 메서드들
   const { messages, sendMessage, connected } = useLobbyChat();
   
   // 세션에서 유저 정보 가져오기
   const sessionUser = JSON.parse(sessionStorage.getItem('USER_INFO'));

   // 메시지 렌더링 커스텀 (로비 채팅용)
   const renderMessage = (message, index) => (
       <div 
           key={index} 
           className={`chat-message ${message.type?.toLowerCase()} ${
               message.userId === sessionUser?.userId ? 'my-message' : ''
           }`}
       >
           {message.type === 'ENTER' ? (
               // 입장 메시지
               <div className="enter-message">
                   {message.content || `${message.username}님이 입장하셨습니다.`}
               </div>
           ) : message.type === 'LEAVE' ? (
               // 퇴장 메시지
               <div className="leave-message">
                   {message.content || `${message.username}님이 퇴장하셨습니다.`}
               </div>
           ) : (
               // 일반 채팅 메시지
               <div className="normal-message">
                   <span className="message-user">{message.username}</span>
                   <span className="message-content">{message.content}</span>
                   <span className="message-time">
                       {new Date(message.timestamp).toLocaleTimeString()}
                   </span>
               </div>
           )}
       </div>
   );

   return (
    <div className='lobbycomp'>
        <div className="lobby-chat">
            <BaseChat
                messages={messages}
                onSendMessage={sendMessage}
                renderMessage={renderMessage}
                connected={connected}
                sessionUser={sessionUser}
            />
        </div>
    </div>
);
};

export default LobbyChat;