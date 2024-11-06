import React from 'react';
import useStompClient from './hooks/socket/UseStompClient';
import { ChatProvider } from './contexts/ChatContext';
import { UserListProvider } from './contexts/UserListContext';
import { GameStartProvider } from './contexts/GameStartContext';
import ChatComponent from './components/ChatComponent';
import UserListComponent from './components/UserListComponent';
import GameStartButton from './components/GameStartButton';

const RoomSocketFeatureComponent = ({ roomId }) => {
    const stompClient = useStompClient();

    if (!stompClient) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Room {roomId}</h2>
            <ChatProvider roomId={roomId}>
                <UserListProvider roomId={roomId}>
                    <GameStartProvider roomId={roomId}>
                        <div>
                            <UserListComponent />
                            <ChatComponent />
                            <GameStartButton />
                        </div>
                    </GameStartProvider>
                </UserListProvider>
            </ChatProvider>
        </div>
    );
};

export default RoomSocketFeatureComponent;