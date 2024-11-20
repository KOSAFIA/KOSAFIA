import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoomProvider } from '../contexts/socket/room/RoomContext';
import RoomComponent from '../components/socket/room/RoomComponent';


function TestRoom() {
    const { roomKey } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const userData = sessionStorage.getItem('userData');
        const player = sessionStorage.getItem('player');
        const storedRoomKey = sessionStorage.getItem('roomKey');

        if (!userData || !player || !storedRoomKey) {
            console.error('필요한 정보가 없습니다. 로비로 이동합니다.');
            navigate('/TestLobby');
            return;
        }

        if (storedRoomKey !== roomKey) {
            console.error('잘못된 방 접근입니다. 로비로 이동합니다.');
            navigate('/TestLobby');
            return;
        }

        return () => {
            console.log('TestRoom 컴포넌트 언마운트');
        };
    }, [navigate, roomKey]);

 
    return (
        <div>
            <RoomProvider roomKey={roomKey}>
                <RoomComponent roomKey={roomKey} />
            </RoomProvider>          
        </div>
    );
}

export default TestRoom;
