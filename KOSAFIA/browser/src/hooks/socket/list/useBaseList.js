// hooks/base/useBaseList.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useBaseSocket } from '../../../contexts/kny/socket/BaseSocketContext';

export const useBaseList = ({ topic, initialList = [] }) => {
    // 목록 상태 관리
    const [list, setList] = useState(initialList);
    // 마지막 업데이트 시간
    const [lastUpdate, setLastUpdate] = useState(null);
    // 소켓 컨텍스트에서 필요한 기능들 가져오기
    const { connected, subscribe } = useBaseSocket();
    // 구독 객체 참조 저장
    const subscription = useRef(null);

    // 목록 업데이트 핸들러
    const handleListUpdate = useCallback((data) => {
        setList(data);
        setLastUpdate(new Date());
    }, []);

    // 토픽 구독 설정
    useEffect(() => {
        if (!connected || !topic) return;

        // 이전 구독 해제
        if (subscription.current) {
            subscription.current.unsubscribe();
        }

        // 새로운 구독 설정
        subscription.current = subscribe(topic, handleListUpdate);

        // 컴포넌트 언마운트 시 구독 해제
        return () => {
            if (subscription.current) {
                subscription.current.unsubscribe();
                subscription.current = null;
            }
        };
    }, [connected, topic, subscribe, handleListUpdate]);

    // 목록 초기화
    const clearList = useCallback(() => {
        setList(initialList);
        setLastUpdate(null);
    }, [initialList]);

    return {
        list,
        lastUpdate,
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