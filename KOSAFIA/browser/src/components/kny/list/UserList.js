import React from 'react';
import { useUserList } from '../../../hooks/socket/list/useUserList';

// components/UserList.js
const UserList = () => {
    const { users, userCount } = useUserList();
    const sessionUser = JSON.parse(sessionStorage.getItem('USER_INFO'));

    if (!sessionUser) return null;

    return (
        <div className="user-list">
            <h3>접속자 목록 ({users.length})</h3>
            {users.map(user => (
                <div
                    key={user.userId}
                    className={user.userId === sessionUser.userId ? 'current-user' : ''}
                >
                    {user.username}
                    {user.userId === sessionUser.userId && ' (나)'}
                </div>
            ))}
        </div>
    );
};

export default UserList;