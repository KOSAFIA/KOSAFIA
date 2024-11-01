// hooks/useStompClient.js
//훅 추가 
// useState : 기본 상태 변수 . 변수의 값이 변할때마다 변한 값을 HTML에 적용해주는 녀석

// useEffect : 상위호환. 그냥 리렌더링 될때마다 실행할 코드를 넣어주는거다. 그런데 리렌더링이란 결국 HTML이 타겟
// -> 타겟을 변경할수 있다. 변수에 클래스에 배열에 등등 타겟을 설정하면 그 타겟의 변화를 감지하여 실행할 코드를 구현 가능
// -> 첫마운트에만 실행되게도 가능
// -> 첫페이지가 그려질때만 실행되게도 가능

// useRef : 결국 실제 돔요소를 참조하게끔 하기 위한 속성값을 지정하고 사용하겠다는 의미 -> 이게 제일 어렵네 -> 아직 모르겠음

import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const UseStompClient = () => {

    // 이 함수는 웹소켓을 통해 서버와 실시간으로 대화하는 방법을 제공합니다
    // 마치 카카오톡처럼 메시지를 주고받을 수 있게 해주죠


// useRef로 웹소켓 클라이언트 관리
// client는 웹소켓 연결을 담당하는 객체
// useRef는 값이 변해도 화면이 새로고침되지 않게 해주는 도구 -> but 상태는 체크하지 계속해서

    const client = useRef(null); //초기화

    //상태 관리
    const [connected, setConnected] = useState(false); // 서버와 연결됐는지
    const [messages, setMessages] = useState([]); // 주고받은 메시지들
    const [userList, setUserList] = useState([]);  // 접속한 사용자 목록


    // 세션 스토리지에서 사용자 정보를 가져오거나, 없으면 임시 사용자 생성
    // 이 코드는 로그인 성공시 유저 정보를 세션에 저장하는 로직이 없기에 임시방편으로 이렇게 만든 거다. 
    const [sessionUser] = useState(() => {
        const existingSession = sessionStorage.getItem('USER_INFO');
        if (existingSession) {
            return JSON.parse(existingSession);
        }

        // 새로운 세션 유저 정보 생성
        const newUser = {
            userId: Date.now(),
            userEmail: `temp${Date.now()}@temp.com`,
            username: `User${Math.floor(Math.random() * 1000)}`,
            status: 1,
            createdAt: new Date().toISOString()
        };

        // 세션 스토리지에 저장
        sessionStorage.setItem('USER_INFO', JSON.stringify(newUser));
        return newUser;
    });

    useEffect(() => {
        const stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/wstomp'),
            debug: function(str) {
                console.log('STOMP:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        stompClient.onConnect = () => {
            console.log('Connected to STOMP');
            setConnected(true);

            // 로비 채팅 구독
        stompClient.subscribe('/topic/lobby', (message) => {
            try {
                const received = JSON.parse(message.body);
                 console.log('Received message:', received);
            
                // 메시지 형식에 맞게 처리
                if (received.type === 'CHAT' || received.type === 'ENTER') {
                    setMessages(prev => [...prev, {
                       type: received.type,
                        userId: received.userId,
                       userEmail: received.userEmail,
                           username: received.username,
                       content: received.content,
                       timestamp: received.timestamp
                    }]);
               }
          } catch (error) {
              console.error('Error parsing message:', error);
          }
        });

            // 입장 메시지 전송
            stompClient.publish({
                destination: '/fromapp/lobby.enter',
                body: JSON.stringify({
                    type: 'ENTER',
                    userId: sessionUser.userId,
                    userEmail: sessionUser.userEmail,
                    username: sessionUser.username
                })
            });
        };

        stompClient.onDisconnect = () => {
            console.log('Disconnected from STOMP');
            setConnected(false);
        };

        stompClient.onStompError = (frame) => {
            console.error('STOMP error:', frame);
        };

        client.current = stompClient;
        stompClient.activate();

        // cleanup on unmount
        return () => {
            if (client.current?.connected) {
                client.current.deactivate();
            }
        };
    }, [sessionUser]);

    const sendMessage = useCallback((content) => {
        if (client.current?.connected) {
            client.current.publish({
                destination: '/fromapp/lobby.chat',
                body: JSON.stringify({
                    type: 'CHAT',
                    userId: sessionUser.userId,
                    userEmail: sessionUser.userEmail,
                    username: sessionUser.username,
                    content: content,
                    timestamp: new Date().toISOString()
                })
            });
        } else {
            console.warn('Cannot send message: Not connected');
        }
    }, [sessionUser]);

    return {
        connected,
        messages,
        sendMessage,
        sessionUser
    };
};

export default UseStompClient;