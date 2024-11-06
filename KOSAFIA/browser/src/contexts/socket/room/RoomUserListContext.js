import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStompClient } from './useStompClient';

const UserListContext = createContext();

export const UserListProvider = ({ roomId, children }) => {
    const [users, setUsers] = useState([]);
    const stompClient = useStompClient();

    useEffect(() => {
        if (stompClient) {
            const subscription = stompClient.subscribe(`/topic/room.users.${roomId}`, (message) => {
                setUsers(JSON.parse(message.body));
            });

            return () => subscription.unsubscribe();
        }
    }, [stompClient, roomId]);

    return (
        <UserListContext.Provider value={{ users }}>
            {children}
        </UserListContext.Provider>
    );
};

export const useUserList = () => useContext(UserListContext);