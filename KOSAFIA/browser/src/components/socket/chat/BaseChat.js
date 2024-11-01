// components/chat/BaseChat.js
// 세션 유저 검증
// 메시지 입력 및 전송
// 자동 스크롤
// 연결 상태 표시
// 메시지 렌더링 (renderMessage prop을 통해 커스터마이징 가능)

import React, { useState, useRef, useEffect } from 'react';

const BaseChat = ({ 
    messages, 
    onSendMessage, 
    renderMessage, 
    connected,
    sessionUser 
}) => {
    // // 세션 체크 이게 에러라고 하네요.
    // if (!sessionUser) {
    //     console.warn('BaseChat: No session user found');
    //     return <div>세션에 유저가 없다..</div>;
    // }

    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);

    // 새 메시지 수신시 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !connected) return;

        onSendMessage(inputMessage.trim());
        setInputMessage('');
    };

    return (
        <div className="chat-base-container">
            <div className="chat-status">
                {connected ? (
                    <span className="status-connected">접속됨</span>
                ) : (
                    <span className="status-disconnected">연결 중...</span>
                )}
            </div>

            <div className="chat-messages">
                {messages.map((msg, index) => renderMessage(msg, index))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="chat-input-form">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    disabled={!connected}
                    className="chat-input"
                />
                <button 
                    type="submit" 
                    disabled={!connected}
                    className="chat-submit-btn"
                >
                    전송
                </button>
            </form>
        </div>
    );
};

export default BaseChat;