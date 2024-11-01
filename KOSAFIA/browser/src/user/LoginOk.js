import React from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginOk() {
  const navigate = useNavigate();

  // 로그아웃 핸들러 함수
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/user/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 세션 쿠키 포함
      });

      if (response.ok) {
        alert("로그아웃 되었습니다."); // 로그아웃 성공 알림
        navigate("/custom-login"); // 로그인 화면으로 리디렉션
      } else {
        alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("로그아웃 오류:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <h1>홈 페이지</h1>
      <p>로그인에 성공했습니다. 환영합니다!</p>
      <button
        onClick={handleLogout}
        style={{
          color: "blue",
          cursor: "pointer",
          textDecoration: "underline",
          background: "none",
          border: "none",
        }}
      >
        로그아웃
      </button>
    </div>
  );
}

export default LoginOk;
