import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Mypage from "./Mypage"; // Mypage 컴포넌트를 불러옵니다.
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

function LoginOk() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isMypageModalOpen, setIsMypageModalOpen] = useState(false);

  useEffect(() => {
    // 로그인한 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/user/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 세션 쿠키 포함
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
        } else {
          console.error("사용자 정보를 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("사용자 정보 로드 오류:", error);
      }
    };

    fetchUserInfo();
  }, []);

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

  // 마이페이지 모달 열기/닫기
  const openMypageModal = () => {
    setIsMypageModalOpen(true);
  };

  const closeMypageModal = () => {
    setIsMypageModalOpen(false);
  };

  return (
    <div>
      <h1>홈 페이지</h1>
      {username && <p>{username}님, 환영합니다!</p>}

      <button
        onClick={handleLogout}
        style={{
          color: "blue",
          cursor: "pointer",
          textDecoration: "underline",
          background: "none",
          border: "none",
          marginBottom: "20px",
        }}
      >
        로그아웃
      </button>

      <button
        onClick={openMypageModal}
        style={{
          color: "blue",
          cursor: "pointer",
          textDecoration: "underline",
          background: "none",
          border: "none",
        }}
      >
        마이페이지
      </button>

      <Modal
        isOpen={isMypageModalOpen}
        onRequestClose={closeMypageModal}
        contentLabel="마이페이지"
        className="mypage-modal"
        overlayClassName="mypage-modal-overlay"
      >
        <Mypage />
        <button onClick={closeMypageModal} style={{ marginTop: "10px" }}>
          닫기
        </button>
      </Modal>
    </div>
  );
}

export default LoginOk;
