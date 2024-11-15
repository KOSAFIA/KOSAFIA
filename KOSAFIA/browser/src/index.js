import React from "react"; // React 라이브러리를 불러옵니다.
import ReactDOM from "react-dom"; // ReactDOM을 사용해 React 컴포넌트를 root에 렌더링합니다.
import Login from "./user/Login"; // Login 컴포넌트를 불러옵니다.
import Register from "./user/Register"; // Register 컴포넌트를 불러옵니다.
import LoginOk from "./user/LoginOk"; //로그인 성공시 나오는 화면
import Mypage from "./user/Mypage";
import TestLobby from "./lobby/TestLobby";
import GameRoom from "./pages/GameRoom";
import TestRoom from './lobby/TestRoom';
import TestPlayRoom from './lobby/TestPlayRoom';


import { BrowserRouter, Routes, Route } from "react-router-dom"; // React Router 라이브러리에서 필요한 컴포넌트를 불러옵니다.


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
      <Route path="/TestLobby" element={<TestLobby />} />
      <Route path="/rooms/:roomKey" element={<TestRoom />} />
      <Route path="/rooms/:roomKey/gameplay" element={<TestPlayRoom />} />

      <Route path="/GameRoom" element={<GameRoom />} />

      <Route path="/TestRoom" element={<TestRoom />} />

    </Routes>
  </BrowserRouter>
);
