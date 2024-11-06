import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs'; // eslint-disable-line import/no-unresolved

const useStompClient = () => {
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        console.log('Initializing STOMP client');
        const socket = new SockJS('http://localhost:8080/wstomp');
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log('STOMP Debug:', str),
            onConnect: () => {
                console.log('STOMP client connected');
                setStompClient(client);
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame.headers['message']);
                console.error('STOMP error details:', frame.body);
            }
        });

        client.activate();
        console.log('STOMP client activated');

        return () => {
            if (client) {
                console.log('Deactivating STOMP client');
                client.deactivate();
            }
        };
    }, []);

    return stompClient;
};

export default useStompClient;
