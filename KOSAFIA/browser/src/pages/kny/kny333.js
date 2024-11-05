import React, { useState } from 'react';
import RoomJoin from '../../components/kny/room/RoomJoin';
import { RoomSocketComponent } from '../../components/kny/room/RoomSocketComponent';
const Kny333 = () => {
    const [joinedRoomId, setJoinedRoomId] = useState(null);

    const handleJoinSuccess = (roomId) => {
        setJoinedRoomId(roomId);
    };

    return (
        <div>
            {!joinedRoomId ? (
                <RoomJoin onJoinSuccess={handleJoinSuccess} />
            ) : (
                <RoomSocketComponent roomId={joinedRoomId} />
            )}
        </div>
    );
};

export default Kny333;