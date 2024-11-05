// hooks/base/useBaseList.js
// hooks/socket/list/useBaseList.js
import { useState, useEffect, useCallback } from 'react';
import { useBaseSocket } from '../../../contexts/socket/BaseSocketContext';

export const useBaseList = ({ topic, initialList = [] }) => {
    const [list, setList] = useState(initialList);
    const { subscribe, connected } = useBaseSocket();

    useEffect(() => {
        if (!connected) return;

        const subscription = subscribe(topic, (data) => {
            setList(data);
        });

        return () => subscription?.unsubscribe();
    }, [topic, connected, subscribe]);

    const clearList = useCallback(() => {
        setList(initialList);
    }, [initialList]);

    return {
        list,
        clearList,
        connected
    };
};

// 주요 특징과 기능:

// useBaseList:

// 일반적인 목록 상태 관리
// WebSocket 구독 처리
// 목록 업데이트 처리
// 마지막 업데이트 시간 관리
// 초기화 기능