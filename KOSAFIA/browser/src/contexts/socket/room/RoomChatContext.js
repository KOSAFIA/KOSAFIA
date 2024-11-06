import React, { createContext, useContext, useState, useEffect } from 'react';
import useStompClient from '../../../hooks/socket/UseStompClient';

const ChatContext = createContext();

export const ChatProvider = ({ roomId, children }) => {
    const [messages, setMessages] = useState([]);
    const stompClient = useStompClient();

    useEffect(() => {
        if (stompClient) {
            const subscription = stompClient.subscribe(`/topic/room.chat.${roomId}`, (message) => {
                setMessages((prevMessages) => [...prevMessages, JSON.parse(message.body)]);
            });

            return () => subscription.unsubscribe();
        }
    }, [stompClient, roomId]);

    const sendMessage = (content) => {
        const chatMessage = { sender: '사용자이름', content, roomId, type: 'CHAT' };
        stompClient.send(`/app/room.chat.send/${roomId}`, {}, JSON.stringify(chatMessage));
    };

    return (
        <ChatContext.Provider value={{ messages, sendMessage }}>
            {children}
        </ChatContext.Provider>
    );
};

//나 자신 컨텍스트를 관리하는 훅 제공
export const useChat = () => useContext(ChatContext);