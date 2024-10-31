// hooks/lobby/useUserList.js
import { useMemo } from 'react';
import { useBaseList } from './useBaseList';
import { useLobbySocket } from '../../../contexts/kny/socket/LobbySocketContext';

export const useUserList = () => {
    // 로비 소켓 컨텍스트에서 설정값과 세션 정보 가져오기
    const { topics, sessionUser } = useLobbySocket();
    
    // 기본 목록 훅 사용
    const {
        list: users,
        lastUpdate,
        clearList: clearUsers,
        connected
    } = useBaseList({
        topic: topics.users,  // /topic/users
        initialList: []
    });

    // 현재 접속 중인 사용자 수
    const userCount = useMemo(() => users.length, [users]);

    // 현재 사용자를 제외한 다른 사용자 목록
    const otherUsers = useMemo(() => {
        if (!sessionUser) return users;
        return users.filter(user => user.userId !== sessionUser.userId);
    }, [users, sessionUser]);

    // 현재 사용자 정보
    const currentUser = useMemo(() => {
        if (!sessionUser) return null;
        return users.find(user => user.userId === sessionUser.userId);
    }, [users, sessionUser]);

    return {
        users,          // 전체 유저 목록
        otherUsers,     // 다른 유저 목록
        currentUser,    // 현재 유저 정보
        userCount,      // 전체 유저 수
        lastUpdate,     // 마지막 업데이트 시간
        clearUsers,     // 목록 초기화 함수
        connected       // 연결 상태
    };
};

// useUserList:

// useBaseList를 확장
// 로비 사용자 목록 전용 기능
// 현재 사용자와 다른 사용자 구분
// 사용자 수 계산
// 세션 사용자 정보 활용