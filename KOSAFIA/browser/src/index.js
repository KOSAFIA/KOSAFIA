import React from 'react';
import { createRoot } from 'react-dom/client';
import GameRoom from './pages/GameRoom';
import App from './Home';
import Kny22 from './pages/kny/Kny22';

// // 엄격한 에러 체크를 위해 console.error 오버라이드
// const originalError = console.error;
// console.error = (...args) => {
//     if (args[0]?.includes('ReactDOM.render is no longer supported')) {
//         return;
//     }
//     originalError(...args);
// };

// React 18의 새로운 루트 API 사용
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        //김남영
        <React.StrictMode>
            <Kny22 />
        </React.StrictMode>

    //             //이하은
    //             <React.StrictMode>
    //             <GameRoom />
    //         </React.StrictMode>

    //                 //차수현
    //     <React.StrictMode>
    //     <App />
    // </React.StrictMode>
    );
} else {
    console.error('Root element not found');
}