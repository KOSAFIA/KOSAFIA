import React from "react"; // React 라이브러리를 불러옵니다.
import ReactDOM from "react-dom"; // ReactDOM을 사용해 React 컴포넌트를 root에 렌더링합니다.
import { createRoot } from "react-dom/client";
import App from "./App"; //하은
import Login from "./user/Login"; // Login 컴포넌트를 불러옵니다.
import Register from "./user/Register"; // Register 컴포넌트를 불러옵니다.
import LoginOk from "./user/LoginOk"; //로그인 성공시 나오는 화면
import Mypage from "./user/Mypage";
import Lobby from "./lobby/Lobby";
import TestLobby from "./lobby/TestLobby";
import GameRoom from "./pages/GameRoom";
import TestRoom from "./lobby/TestRoom";
import TestPlayRoom from "./lobby/TestPlayRoom";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // React Router 라이브러리에서 필요한 컴포넌트를 불러옵니다.

import SimpleMafiaChat from "./fast/gamechat/MafiaChat";
import SimpleMafiaChatBtn from "./fast/gamechat/SimpleMafiaChatBtn";

import GameStart from "./fast/gamechat/GameStart";

//이하은
//ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// 차수현
//root ID를 가진 DOM 요소에 React 컴포넌트를 렌더링합니다.
// ReactDOM.createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     <Routes>
//       <Route path="/" element={<Login />} />
//       <Route path="/custom-login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/LoginOk" element={<LoginOk />} />
//       <Route path="/mypage" element={<Mypage />} />
//       <Route path="/lobby" element={<Lobby />} />
//     </Routes>
//   </BrowserRouter>
// );

// // React 18의 새로운 루트 API 사용
// const container = document.getElementById('root');
// if (container) {
//     const root = createRoot(container);
//     root.render(
//         //김남영
//         <React.StrictMode>
//             <Kny22 />
//         </React.StrictMode>
// } else {
//     console.error('Root element not found');
// }

// //김지연
// ReactDOM.createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     <Routes>
//       <Route path="/" element={<Login />} />
//       <Route path="/custom-login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       {/* <Route path="/LoginOk" element={<Lobby />} /> */}
//       <Route path="/mypage" element={<Mypage />} />
//       <Route path="/TestLobby" element={<TestLobby />} />
//     </Routes>
//   </BrowserRouter>
// );

// //김남영 게임방 테스트
// ReactDOM.createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     <Routes>
//       <Route path="/" element={<Login />} />
//       <Route path="/custom-login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       {/* <Route path="/LoginOk" element={<LoginOk />} /> */} ///차수현
//       <Route path="/LoginOk" element={<Kny333/>} /> ///김남영 테스트
//     </Routes>
//   </BrowserRouter>
// );

// //김남영 심플 마피아 챗
// ReactDOM.createRoot(document.getElementById("root")).render(

//   <React.StrictMode>
//     <GameStart />
//   </React.StrictMode>,
//   document.getElementById('root')

// );

// TestLobby에 네비게이션 바 포함한 레이아웃 컴포넌트 //수현
function TestLobbyWithNavbar() {
  return (
    <>
      <LoginOk /> {/* 항상 상단에 네비게이션 바 표시 */}
      <TestLobby /> {/* TestLobby 화면 */}
    </>
  );
}

//김남영 유저 리스트 리프레시 업데이트
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/LoginOk" element={<LoginOk />} />
      <Route path="/custom-login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* <Route path="/LoginOk" element={<Lobby />} /> */}
      <Route path="/mypage" element={<Mypage />} />
      <Route path="/TestLobby" element={<TestLobbyWithNavbar />} />
      {/* TestLobby에만 네비게이션 포함 */}
      <Route path="/rooms/:roomKey" element={<TestRoom />} />
      <Route path="/rooms/:roomKey/gameplay" element={<TestPlayRoom />} />

      <Route path="/GameRoom" element={<GameRoom />} />
    </Routes>
  </BrowserRouter>
);
