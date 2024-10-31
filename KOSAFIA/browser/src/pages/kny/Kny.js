// // src/App.js
// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// import LoginPage from './LoginPage';
// import MainLobby from './MainLobby';

// import { UserProvider, useUser } from '../../contexts/KNY/UserContext';

// import { ChatSocketProvider } from '../../contexts/KNY/ChatSocketContext';

// // 인증된 사용자만 접근 가능하게 하는 컴포넌트
// const ProtectedRoute = ({ children }) => {
//     // 세션에 USER_ID가 있는지 확인
//     const { user } = useUser();
//     return user ? children : <Navigate to="/" />;
// };

// const Kny = () => {
//     return (
//         <UserProvider>
//             <ChatSocketProvider>
//             <BrowserRouter>
//             <Routes>
//                 {/* 로그인 페이지 - 기본 경로 */}
//                 <Route path="/" element={<LoginPage />} />
                
//                 {/* 로비 페이지 - 보호된 라우트 */}
//                 <Route 
//                     path="/lobby" 
//                     element={
//                         <ProtectedRoute>
//                             <MainLobby />
//                         </ProtectedRoute>
//                     } 
//                 />
//             </Routes>
//         </BrowserRouter>

//             </ChatSocketProvider>

//         </UserProvider>

//     );
// };

// export default Kny;


// pages/KNY/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from '../../contexts/kny/oldstable/UserContext';
import { ChatSocketProvider } from '../../contexts/kny/oldstable/ChatSocketContext';
import LoginPage from './LoginPage';
import MainLobby from './MainLobby';
import { StompClientProvider } from '../contexts/kny/StompClientContext';

// 라우팅이 제대로 되는지 확인하기 위한 테스트 문구 추가
const Kny = () => {
    console.log("App Component Rendered");  // 디버깅용 로그 추가
    
    //로그인 테스트 하던거 포기
    // return (
    //     <div>
    //         <h1>React App Loaded</h1>  {/* 테스트용 문구 */}
    //         <UserProvider>
    //             <ChatSocketProvider>
    //                 <BrowserRouter basename='/react'>
    //                     <Routes>
    //                         <Route path="/" element={
    //                             <div>
    //                                 <h2>login page container</h2>
    //                                 <LoginPage />
    //                             </div>
    //                         } />
    //                         <Route path="/lobby" element={
    //                             <div>
    //                                 <h3>lobby lobby</h3>
    //                                 <MainLobby />
    //                             </div>
    //                         } />
    //                     </Routes>
    //                 </BrowserRouter>
    //             </ChatSocketProvider>
    //         </UserProvider>
    //     </div>
    // );

    //바로 로비방 열려서 채팅하는거 테스트
    return (

        <StompClientProvider>
            <MainLobby/>
        </StompClientProvider>
    );
};

export default Kny;