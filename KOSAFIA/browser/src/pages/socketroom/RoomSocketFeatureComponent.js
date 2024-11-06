import React from 'react';
import useStompClient from '../../hooks/socket/UseStompClient';
import { ChatProvider } from '../../contexts/socket/room/RoomChatContext';
import { UserListProvider } from '../../contexts/socket/room/RoomUserListContext';
import { GameStartProvider } from '../../contexts/socket/room/GameStartContext';
import RoomChatComponent from '../../components/socket/room/RoomChatComponet';
import RoomUserListComponent from '../../components/socket/room/RoomUserListComponent';
import GameStartButton from '../../components/socket/room/GameStartButton';

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
                            <RoomUserListComponent />
                            <RoomChatComponent />
                            <GameStartButton />
                        </div>
                    </GameStartProvider>
                </UserListProvider>
            </ChatProvider>
        </div>
    );
};

export default RoomSocketFeatureComponent;