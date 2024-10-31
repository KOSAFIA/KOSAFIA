// components/UserList.js
import React from 'react';
import { useUserList } from '../../../hooks/socket/list/useUserList';

const UserList = () => {    // sessionUser prop 제거
    const { users, currentUser, userCount } = useUserList();
    const sessionUser = JSON.parse(sessionStorage.getItem('USER_INFO')); // 직접 가져오기

    if (!sessionUser) return null;

    return (
        <div className="user-list">
            <h3>접속자 목록 ({userCount})</h3>
            {users.map(user => (
                <div
                    key={user.userId}
                    className={user.userId === sessionUser.userId ? 'current-user' : ''}
                >
                    {user.username}
                </div>
            ))}
        </div>
    );
};

export default UserList;