import React, { useState } from 'react';
import { useChat } from '../../../contexts/socket/room/RoomChatContext';

const RoomChatComponent = () => {
    const { messages, sendMessage } = useChat();
    const [input, setInput] = useState('');

    const handleSend = () => {
        console.log('Send button clicked');
        console.log('Current input:', input);

        if (input.trim()) {
            console.log('Sending message:', input);
            sendMessage(input);
            setInput('');
        } else {
            console.log('Input is empty, not sending message');
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>{msg.sender}: {msg.content}</div>
                ))}
            </div>
            <input 
                value={input} 
                onChange={(e) => {
                    console.log('Input changed:', e.target.value);
                    setInput(e.target.value);
                }} 
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
};

export default RoomChatComponent;