// src/components/SendButton.js
import React from 'react';
import '../styles/components/SendButton.css'; // SendButton의 CSS 파일을 import합니다.

const SendButton = ({ onClick }) => {
    return (
        <button className="send-button" onClick={onClick}></button>
    );
};

export default SendButton;
