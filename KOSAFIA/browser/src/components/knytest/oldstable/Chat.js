// // src/components/Chat.js
// import React, { useState, useRef, useEffect } from 'react';

// import { useChatSocket } from '../../contexts/KNY/ChatSocketContext';
// import { useUser } from '../../contexts/KNY/UserContext';

// const Chat = () => {
//     const { messages, sendMessage, isConnected } = useChatSocket();
//     const { user } = useUser();
//     const [newMessage, setNewMessage] = useState('');
//     const messagesEndRef = useRef(null);

//     // 새 메시지가 올 때마다 스크롤을 아래로
//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     };

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages]);

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (newMessage.trim() && isConnected) {  // 연결 상태 확인
//             const sent = sendMessage(newMessage);
//             if (sent) {
//                 setNewMessage('');
//             }
//         }
//     };

//     return (
//         <div className="chat-container">
//             {/* 연결 상태 표시 */}
//             <div style={{ 
//                 padding: '5px', 
//                 backgroundColor: isConnected ? '#e8f5e9' : '#ffebee',
//                 marginBottom: '10px',
//                 borderRadius: '4px'
//             }}>
//                 {isConnected ? '채팅 연결됨' : '채팅 연결 중...'}
//             </div>
//             <div className="messages-container" style={{
//                 height: '400px',
//                 overflowY: 'auto',
//                 border: '1px solid #ccc',
//                 padding: '10px',
//                 marginBottom: '10px'
//             }}>
//                 {messages.map((msg, index) => (
//                     <div key={index} style={{
//                         marginBottom: '10px',
//                         textAlign: msg.userId === user.userId ? 'right' : 'left'
//                     }}>
//                         <strong>{msg.username}: </strong>
//                         {msg.content}
//                     </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//             </div>

//             <form onSubmit={handleSubmit} style={{
//                 display: 'flex',
//                 gap: '10px'
//             }}>
//                 <input
//                     type="text"
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     placeholder="메시지를 입력하세요..."
//                     style={{ flex: 1, padding: '5px' }}
//                 />
//                 <button type="submit">전송</button>
//             </form>
//         </div>
//     );
// };

// export default Chat;

///위에는 세션 고려 밑에는 그냥 단순 랜챗

import React, { useState, useRef, useEffect } from 'react';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const messagesEndRef = useRef(null);

    // 웹소켓 연결
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080/ws/chat');

        ws.onopen = () => {
            console.log('WebSocket Connected');
            setConnected(true);
            ws.send(JSON.stringify({
                type: 'JOIN',
                username: '익명' + Math.floor(Math.random() * 1000),  // 임시 사용자 이름
                userId: Date.now().toString()  // 임시 ID
            }));
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setMessages(prev => [...prev, message]);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
            setConnected(false);
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, []);

    // 메시지 전송
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !connected) return;

        const messageData = {
            type: 'CHAT',
            username: '익명' + Math.floor(Math.random() * 1000),  // 임시 사용자 이름
            userId: Date.now().toString(),  // 임시 ID
            content: newMessage
        };

        socket.send(JSON.stringify(messageData));
        setNewMessage('');
    };

    return (
        <div>
            <div style={{
                height: '400px',
                overflowY: 'auto',
                border: '1px solid #ccc',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px'
            }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{
                        marginBottom: '10px',
                        padding: '5px',
                        backgroundColor: msg.type === 'JOIN' ? '#e3f2fd' : '#fff',
                        borderRadius: '4px'
                    }}>
                        <strong>{msg.username}: </strong>
                        {msg.type === 'JOIN' ? '입장했습니다.' : msg.content}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button 
                    type="submit"
                    disabled={!connected}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: connected ? '#4CAF50' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: connected ? 'pointer' : 'not-allowed'
                    }}
                >
                    전송
                </button>
            </form>
        </div>
    );
};

export default Chat;