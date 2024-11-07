// contexts/socket/room/RoomContext.js
// 이 파일은 방의 상태와 기능을 공유하기 위한 RoomContext를 정의합니다.
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs'; //eslint-disable-line

// 방의 모든 정보와 기능을 담는 상자를 만들어요
const RoomContext = createContext();

// 방에 들어온 사람들에게 필요한 정보와 기능을 제공하는 특별한 상자예요
export const RoomProvider = ({ roomKey, children }) => {
    // 방에서 필요한 정보를 저장하는 곳이에요
    const [messages, setMessages] = useState([]); // 채팅 메시지를 모아두는 곳
    const [users, setUsers] = useState([]); // 방에 있는 사람들 목록
    const [isConnected, setIsConnected] = useState(false); // 웹소켓이 연결되었는지 확인하는 곳
    const clientRef = useRef(null); // 웹소켓 연결을 안전하게 보관하는 곳
    const messageQueue = useRef([]); // 아직 보내지 못한 메시지를 임시로 보관하는 곳

    // 방에 들어왔을 때 다른 사람들에게 알려주는 함수예요
    const sendInitialUserData = useCallback((client, roomKey) => {
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        if (userData) {
            console.log('입장 메시지를 보내기 전 userData:', userData);
            client.publish({
                destination: `/fromapp/room.user.join/${roomKey}`,
                body: JSON.stringify(userData)
            });
            console.log('입장 메시지를 보냈어요:', userData);
        } else {
            console.error('userData를 찾을 수 없어요!');
        }
    }, []);

    // 방에서 일어나는 일들을 듣고 있는 함수예요
    const setupSubscriptions = useCallback((client, roomKey) => {
        console.log('구독 설정을 시작합니다...');
        
        // 유저 리스트 구독
        const userSubscription = client.subscribe(`/topic/room.users.${roomKey}`, (message) => {
            console.log('유저 리스트 메시지가 도착했어요:', message);
            try {
                const userList = JSON.parse(message.body);
                console.log('파싱된 유저 리스트:', userList);
                if (Array.isArray(userList)) {
                    setUsers(userList);
                    console.log('유저 리스트가 업데이트되었어요:', userList);
                } else {
                    console.error('받은 유저 리스트가 배열이 아니에요:', userList);
                }
            } catch (error) {
                console.error('유저 리스트 처리 중 문제가 발생했어요:', error);
            }
        });

        // 채팅 메시지 구독
        const chatSubscription = client.subscribe(`/topic/room.chat.${roomKey}`, (message) => {
            console.log('채팅 메시지가 도착했어요:', message);
            try {
                const chatMessage = JSON.parse(message.body);
                setMessages(prev => [...prev, chatMessage]);
                console.log('새로운 채팅 메시지를 추가했어요:', chatMessage);
            } catch (error) {
                console.error('채팅 메시지 처리 중 문제가 발생했어요:', error);
            }
        });

        // 게임 시작 신호 구독 추가
        const gameStartSubscription = client.subscribe(`/topic/room.game.start.${roomKey}`, (message) => {
            console.log('게임 시작 신호가 도착했어요:', message);
            try {
                const gameStartMessage = JSON.parse(message.body);
                console.log('게임을 시작할 준비가 되었어요:', gameStartMessage);
                // TODO: 게임 시작 처리 로직 추가
                // 예: navigate(`/rooms/${roomKey}/gameplay`);
            } catch (error) {
                console.error('게임 시작 신호를 처리하는 중 문제가 발생했어요:', error);
            }
        });

        console.log(`구독 설정이 모두 완료되었어요!`);

        // 컴포넌트가 언마운트될 때 모든 구독 해제
        return () => {
            if (userSubscription) {
                userSubscription.unsubscribe();
                console.log('유저 리스트 구독을 해제했어요');
            }
            if (chatSubscription) {
                chatSubscription.unsubscribe();
                console.log('채팅 구독을 해제했어요');
            }
            if (gameStartSubscription) {
                gameStartSubscription.unsubscribe();
                console.log('게임 시작 구독을 해제했어요');
            }
        };
    }, []);

    // 방에 처음 들어왔을 때 웹소켓 연결을 시작하는 부분이에요
    useEffect(() => {
        console.log('방에 입장했어요! 웹소켓 연결을 시작합니다...');
        const socket = new SockJS('http://localhost:8080/wstomp');
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log('STOMP 디버그:', str),
            reconnectDelay: 5000, // 연결이 끊어지면 5초 후에 다시 연결을 시도해요
            onConnect: () => {
                console.log('방과 연결이 되었어요!');
                setIsConnected(true);
                clientRef.current = client;
                
                // 방에서 일어나는 일들을 듣기 시작해요
                setupSubscriptions(client, roomKey);
                // 다른 사람들에게 내가 방에 들어왔다고 알려요
                sendInitialUserData(client, roomKey);

                // 아직 보내지 못한 메시지가 있다면 지금 보내요
                while (messageQueue.current.length > 0) {
                    const { destination, body } = messageQueue.current.shift();
                    client.publish({ destination, body });
                    console.log('아까 보내지 못한 메시지를 지금 보냈어요!');
                }
            },
            onStompError: (frame) => {
                console.error('방 연결에 문제가 생겼어요:', frame.headers['message']);
                console.error('자세한 내용:', frame.body);
            },
            onWebSocketClose: () => {
                console.warn('방과의 연결이 끊어졌어요.');
                setIsConnected(false);
            },
            onWebSocketError: (error) => {
                console.error('방 연결에 문제가 생겼어요:', error);
                setIsConnected(false);
            }
        });

        client.activate(); // 방과 연결을 시작해요
        
        // 방을 나갈 때 깔끔하게 정리해요
        return () => {
            console.log('방을 나갑니다. 연결을 정리할게요...');
            if (client) {
                client.deactivate();
            }
        };
    }, [roomKey, setupSubscriptions, sendInitialUserData]);

    // 채팅 메시지를 보내는 함수예요
    const sendMessage = useCallback((content) => {
        if (isConnected && clientRef.current) {
            try {
                const userData = JSON.parse(sessionStorage.getItem('userData'));
                const username = userData ? userData.username : '알 수 없는 사용자';
                const chatMessage = { username, content, roomKey };
                
                clientRef.current.publish({
                    destination: `/fromapp/room.chat.send/${roomKey}`,
                    body: JSON.stringify(chatMessage)
                });
                console.log('채팅 메시지를 보냈어요:', chatMessage);
            } catch (error) {
                console.error('채팅 메시지를 보내다가 문제가 생겼어요:', error);
            }
        } else {
            console.warn('아직 방과 연결이 안 되어서, 메시지를 잠시 보관할게요.');
            messageQueue.current.push({
                destination: `/fromapp/room.chat.send/${roomKey}`,
                body: JSON.stringify({
                    username: '알 수 없는 사용자',
                    content,
                    roomKey
                })
            });
        }
    }, [isConnected, roomKey]);

    // 게임 시작 신호를 보내는 함수예요
    const startGame = useCallback(() => {
        if (isConnected && clientRef.current) {
            try {
                const startMessage = { roomKey, message: '게임 시작' };
                clientRef.current.publish({
                    destination: `/fromapp/room.game.start/${roomKey}`,
                    body: JSON.stringify(startMessage)
                });
                console.log('게임 시작 신호를 보냈어요!');
            } catch (error) {
                console.error('게임 시작 신호를 보내다가 문제가 생겼어요:', error);
            }
        } else {
            console.warn('아직 방과 연결이 안 되어서, 게임 시작 신호를 잠시 보관할게요.');
            messageQueue.current.push({
                destination: `/fromapp/room.game.start/${roomKey}`,
                body: JSON.stringify({ roomKey, message: '게임 시작' })
            });
        }
    }, [isConnected, roomKey]);

    // 방에서 사용할 수 있는 모든 기능과 정보를 담아서 내보내요
    const value = {
        messages,    // 채팅 메시지 목록
        users,       // 방에 있는 사람들 목록
        isConnected, // 방 연결 상태
        sendMessage, // 채팅 메시지 보내는 함수
        startGame    // 게임 시작 신호 보내는 함수
    };

    return (
        <RoomContext.Provider value={value}>
            {children}
        </RoomContext.Provider>
    );
};

// 다른 곳에서 방의 정보와 기능을 쉽게 가져다 쓸 수 있게 해주는 함수예요
export const useRoomContext = () => {
    const context = useContext(RoomContext);
    if (!context) {
        throw new Error('useRoomContext는 RoomProvider 안에서만 사용할 수 있어요!');
    }
    return context;
};