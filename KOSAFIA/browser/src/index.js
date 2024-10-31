import React from "react"; // React 라이브러리를 불러옵니다.
import ReactDOM from "react-dom"; // ReactDOM을 사용해 React 컴포넌트를 root에 렌더링합니다.
//import GameRoom from "./pages/GameRoom"; //하은
import Login from "./user/Login"; // Login 컴포넌트를 불러옵니다.
import Register from "./user/Register"; // Register 컴포넌트를 불러옵니다.
import LoginOk from "./user/LoginOk"; //로그인 성공시 나오는 화면
//import LoginPage from "./pages/KnyLogin"; //남영
import { BrowserRouter, Routes, Route } from "react-router-dom"; // React Router 라이브러리에서 필요한 컴포넌트를 불러옵니다.

//이하은
// ReactDOM.createRoot(document.getElementById('root')).render(<GameRoom/>);

// 차수현
// root ID를 가진 DOM 요소에 React 컴포넌트를 렌더링합니다.
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/custom-login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/LoginOk" element={<LoginOk />} />
    </Routes>
  </BrowserRouter>
);

//김남영
//ReactDOM.createRoot(document.getElementById("root")).render(<LoginPage />);
