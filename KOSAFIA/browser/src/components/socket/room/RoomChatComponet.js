import React, { useState } from 'react';
import { useChat } from '../../contexts/socket/room/RoomChatContext';

const RoomChatComponent = () => {
    const { messages, sendMessage } = useChat();
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            sendMessage(input);
            setInput('');
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>{msg.sender}: {msg.content}</div>
                ))}
            </div>
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={handleSend}>Send</button>
        </div>
    );
};

export default RoomChatComponent;