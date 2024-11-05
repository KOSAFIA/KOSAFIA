import React from 'react';
import { useRoom } from '../../../contexts/socket/room/RoomContext';

const RoomUserList = () => {
  const { users } = useRoom();

  return (
    <div className="user-list-container">
      <h3>참가자 목록 ({users.length})</h3>
      <ul className="user-list">
        {users.map((user) => (
          <li key={user.userId} className="user-item">
            {user.username}
          </li>
        ))}
      </ul>

      <style jsx>{`
        .user-list-container {
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin: 10px;
        }

        .user-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .user-item {
          padding: 8px;
          border-bottom: 1px solid #eee;
        }

        .user-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default RoomUserList;
