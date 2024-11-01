// hooks/lobby/useUserList.js
// hooks/socket/list/useUserList.js
import { useBaseList } from './useBaseList';
import { useLobbySocket } from '../../../contexts/socket/LobbySocketContext';

export const useUserList = () => {
    const { topics, sessionUser } = useLobbySocket();
    
    const {
        list: users,
        connected
    } = useBaseList({
        topic: topics.users
    });

    return {
        users,
        userCount: users.length,
        currentUser: sessionUser,
        connected
    };
};

// useUserList:

// useBaseList를 확장
// 로비 사용자 목록 전용 기능
// 현재 사용자와 다른 사용자 구분
// 사용자 수 계산
// 세션 사용자 정보 활용