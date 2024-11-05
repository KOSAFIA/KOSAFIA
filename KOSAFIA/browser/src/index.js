import React from "react"; // React 라이브러리를 불러옵니다.
import ReactDOM from "react-dom"; // ReactDOM을 사용해 React 컴포넌트를 root에 렌더링합니다.
import { createRoot } from "react-dom/client";
import App from "./App"; //하은
import Login from "./user/Login"; // Login 컴포넌트를 불러옵니다.
import Register from "./user/Register"; // Register 컴포넌트를 불러옵니다.
import LoginOk from "./user/LoginOk"; //로그인 성공시 나오는 화면
import Mypage from "./user/Mypage";
import TestLobby from "./lobby/TestLobby";

import Kny22 from "./pages/kny/Kny22";

import { BrowserRouter, Routes, Route } from "react-router-dom"; // React Router 라이브러리에서 필요한 컴포넌트를 불러옵니다.

//이하은
// ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// // 차수현
// // root ID를 가진 DOM 요소에 React 컴포넌트를 렌더링합니다.
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

//김지연
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/custom-login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* <Route path="/LoginOk" element={<Lobby />} /> */}
      <Route path="/mypage" element={<Mypage />} />
      <Route path="/TestLobby" element={<TestLobby />} />
    </Routes>
  </BrowserRouter>
);
