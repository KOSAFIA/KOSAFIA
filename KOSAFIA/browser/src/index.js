import React from "react"; // React 라이브러리를 불러옵니다.
import ReactDOM from "react-dom"; // ReactDOM을 사용해 React 컴포넌트를 root에 렌더링합니다.
import Login from "./user/Login"; // Login 컴포넌트를 불러옵니다.
import Register from "./user/Register"; // Register 컴포넌트를 불러옵니다.
import LoginOk from "./user/LoginOk"; //로그인 성공시 나오는 화면
import Mypage from "./user/Mypage";
import TestLobby from "./lobby/TestLobby";
import GameRoom from "./pages/GameRoom";
import TestRoom from "./lobby/TestRoom";
import TestPlayRoom from "./lobby/TestPlayRoom";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // React Router 라이브러리에서 필요한 컴포넌트를 불러옵니다.
import "./styles/components/index.css"; // 전역 스타일 임포트
// TestLobby에 네비게이션 바 포함한 레이아웃 컴포넌트 //수현
function TestLobbyWithNavbar() {
  return (
    <>
      <LoginOk /> {/* 항상 상단에 네비게이션 바 표시 */}
      <div className="content">
        <TestLobby /> {/* TestLobby 내용 */}
      </div>
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
      {/* 김남영 추가: 이하은 페이지로 이동 테스트 플레이룸은 소켓과 이하은 게임룸을 감쌈쌈*/}
      {/* <Route path="/rooms/:roomKey/gameplay" element={<GameRoom />} /> */}

      <Route path="/GameRoom" element={<GameRoom />} />

      <Route path="/TestRoom" element={<TestRoom />} />

    </Routes>
  </BrowserRouter>
);
