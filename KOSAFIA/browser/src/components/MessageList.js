import React from 'react';
import '../styles/components/MessageList.css';

const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div key={index} className="message">
          <span className="player-name">{msg.player}:</span> {msg.text}
        </div>
      ))}
    </div>
  );
};

export default MessageList;