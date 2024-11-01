import React, { useState, forwardRef, useImperativeHandle } from 'react';
import '../styles/components/ChatBox.css';

const ChatBox = forwardRef((props, ref) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useImperativeHandle(ref, () => ({
        receiveMessage: (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        },
    }));

    const handleSendMessage = () => {
        if (input.trim() === '') return;
        setMessages([...messages, input]);
        setInput('');
    };

    return (
        <div className="chat-box">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        {msg}
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                />
                <button onClick={handleSendMessage}>전송</button>
            </div>
        </div>
    );
});

export default ChatBox;
