// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';
// import { useState, useCallback } from 'react';

// export const useWebSocket = () => {
//   const [connected, setConnected] = useState(false);
//   const [error, setError] = useState(null);

//   const createStompClient = useCallback(() => {
//     const client = new Client({
//       webSocketFactory: () => new SockJS('/wstomp'),
//       debug: (str) => console.log(str),
//       onConnect: () => {
//         setConnected(true);
//         setError(null);
//       },
//       onDisconnect: () => {
//         setConnected(false);
//       },
//       onError: (err) => {
//         setError(err);
//         setConnected(false);
//       }
//     });

//     return client;
//   }, []);

//   const connect = useCallback(() => {
//     const client = createStompClient();
//     client.activate();
//     return client;
//   }, [createStompClient]);

//   const disconnect = useCallback((client) => {
//     if (client && client.connected) {
//       client.deactivate();
//     }
//   }, []);

//   return {
//     connected,
//     error,
//     connect,
//     disconnect
//   };
// };