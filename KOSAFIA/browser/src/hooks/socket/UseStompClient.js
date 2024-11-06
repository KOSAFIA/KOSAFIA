import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs'

const useStompClient = () => {
    const client = useRef(null);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        // STOMP 클라이언트 생성
        const socket = new SockJS('http://localhost:8080/wstomp');
        const newClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log('STOMP:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        // 연결 성공시 콜백
        newClient.onConnect = () => {
            console.log('STOMP 연결 성공');
            setStompClient(newClient);
        };

        // 연결 해제시 콜백 
        newClient.onDisconnect = () => {
            console.log('STOMP 연결 해제');
            setStompClient(null);
        };

        // 에러 발생시 콜백
        newClient.onStompError = (frame) => {
            console.error('STOMP 에러:', frame);
        };

        client.current = newClient;
        newClient.activate();

        // 컴포넌트 언마운트시 연결 해제
        return () => {
            if (client.current?.connected) {
                client.current.deactivate();
            }
        };
    }, []);

    return stompClient;
};

export default useStompClient;
