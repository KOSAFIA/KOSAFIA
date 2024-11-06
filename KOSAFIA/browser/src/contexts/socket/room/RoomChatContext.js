import React, { createContext, useContext, useState, useEffect } from 'react';
import useStompClient from '../../../hooks/socket/UseStompClient';

const ChatContext = createContext();

export const ChatProvider = ({ roomId, children }) => {
    const [messages, setMessages] = useState([]);
    const stompClient = useStompClient();

    useEffect(() => {
        if (stompClient) {
            console.log('STOMP client is initialized:', stompClient);
            console.log('STOMP client connected:', stompClient.connected);
        } else {
            console.log('STOMP client is not initialized yet');
        }
    }, [stompClient]);

    useEffect(() => {
        if (stompClient && stompClient.connected) {
            console.log('Subscribing to topic:', `/topic/room.chat.${roomId}`);
            const subscription = stompClient.subscribe(`/topic/room.chat.${roomId}`, (message) => {
                console.log('Received message:', message.body);
                setMessages((prevMessages) => [...prevMessages, JSON.parse(message.body)]);
            });

            return () => {
                console.log('Unsubscribing from topic:', `/topic/room.chat.${roomId}`);
                subscription.unsubscribe();
            };
        }
    }, [stompClient, roomId]);

    const sendMessage = (content) => {
        const user = sessionStorage.getItem('user');
        const username = user ? JSON.parse(user).username : 'Unknown User';

        const chatMessage = { username, content, roomId };
        console.log('Attempting to send message:', chatMessage);

        if (stompClient && stompClient.connected) {
            stompClient.send(`/fromapp/room.chat.send/${roomId}`, {}, JSON.stringify(chatMessage));
            console.log('Message sent successfully');
        } else {
            console.error('STOMP client is not connected or send method is not available');
        }
    };

    return (
        <ChatContext.Provider value={{ messages, sendMessage }}>
            {children}
        </ChatContext.Provider>
    );
};

//나 자신 컨텍스트를 관리하는 훅 제공
export const useChat = () => useContext(ChatContext);