import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Mypage from "./Mypage"; // Mypage 컴포넌트를 불러옵니다.
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root"); // 모달이 열릴 때 #root 외부의 콘텐츠는 접근 불가로 설정

function LoginOk() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isMypageModalOpen, setIsMypageModalOpen] = useState(false); // 마이페이지 모달 열림 상태

  // 컴포넌트가 처음 렌더링될 때 사용자 정보를 가져오는 함수입니다.
  useEffect(() => {
    // 로그인한 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/user/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 세션 쿠키를 포함하여 요청
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username); // 사용자 이름 상태를 업데이트합니다.
        } else {
          console.error("사용자 정보를 불러오는 데 실패했습니다.");
          navigate("/custom-login"); // 로그인 실패 시 로그인 페이지로 리디렉션
        }
      } catch (error) {
        console.error("사용자 정보 로드 오류:", error);
        navigate("/custom-login"); // 오류 발생 시 로그인 페이지로 리디렉션
      }
    };

    fetchUserInfo();
  }, [navigate]); // navigate 의존성을 추가하여 navigate 함수가 변경되면 useEffect가 다시 실행됩니다.

  // 로그아웃 핸들러 함수
  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청을 보냅니다.
      const response = await fetch("http://localhost:8080/api/user/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 세션 쿠키를 포함하여 요청
      });

      if (response.ok) {
        alert("로그아웃 되었습니다."); // 로그아웃 성공시 알림
        navigate("/custom-login"); // 로그인 화면으로 리디렉션
      } else {
        alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("로그아웃 오류:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  // 마이페이지 모달 열기
  const openMypageModal = () => {
    setIsMypageModalOpen(true); // 마이페이지 모달을 열리도록 상태를 true로 변경
  };

  // 마이페이지 모달 닫기
  const closeMypageModal = () => {
    setIsMypageModalOpen(false); // 마이페이지 모달을 닫도록 상태를 false로 변경
  };

  return (
    <div className="login-ok-container">
      <h1>홈 페이지</h1>
      {username && <p>{username}님, 환영합니다!</p>}

      <button className="logout-button" onClick={handleLogout}>
        로그아웃
      </button>

      <button className="mypage-button" onClick={openMypageModal}>
        마이페이지
      </button>

      <Modal
        isOpen={isMypageModalOpen} // 모달 열림 여부를 결정하는 상태
        onRequestClose={closeMypageModal} // 모달 외부 클릭 시 닫히도록 설정
        contentLabel="마이페이지" // 접근성을 위한 모달 설명
        className="mypage-modal" // 모달 스타일 클래스
        overlayClassName="mypage-modal-overlay" // 모달 배경 스타일 클래스
      >
        <Mypage setUsername={setUsername} /> {/* setUsername을 Mypage에 전달 */}
        <button onClick={closeMypageModal} style={{ marginTop: "10px" }}>
          닫기
        </button>
      </Modal>
    </div>
  );
}

export default LoginOk;
