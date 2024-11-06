import React from 'react';
import { useUserList } from '../../../contexts/socket/room/RoomUserListContext';

const RoomUserListComponent = () => {
    const { users } = useUserList();

    return (
        <div>
            <h3>Users in Room</h3>
            <ul>
                {users.map((user, index) => (
                    <li key={index}>{user.username}</li>
                ))}
            </ul>
        </div>
    );
};

export default RoomUserListComponent;