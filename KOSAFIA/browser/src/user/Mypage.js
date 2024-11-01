import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import "../styles/components/Mypage.css";

Modal.setAppElement("#root");

function Mypage() {
  const [userEmail, setUserEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isPasswordChangeSuccess, setIsPasswordChangeSuccess] = useState(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/user/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.user_email);
          setUsername(data.username);
        } else {
          console.error("사용자 정보를 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("사용자 정보 로드 오류:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleUsernameSave = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/user/update-username",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username }),
        }
      );

      if (response.ok) {
        setMessage("닉네임이 성공적으로 변경되었습니다.");
        setIsEditingUsername(false);
      } else {
        setMessage("닉네임 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("닉네임 수정 오류:", error);
      setMessage("닉네임 변경 중 오류가 발생했습니다.");
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      setMessage("새 비밀번호가 일치하지 않습니다.");
      setIsPasswordChangeSuccess(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/user/update-password",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      if (response.ok) {
        setMessage("비밀번호가 성공적으로 변경되었습니다.");
        setIsPasswordChangeSuccess(true);
        setIsPasswordModalOpen(false); // 비밀번호 수정 모달 닫기
        setIsSuccessPopupOpen(true); // 성공 팝업 열기
      } else {
        setMessage("비밀번호 변경에 실패했습니다.");
        setIsPasswordChangeSuccess(false);
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      setMessage("비밀번호 변경 중 오류가 발생했습니다.");
      setIsPasswordChangeSuccess(false);
    }
  };

  const openPasswordModal = () => {
    setIsPasswordModalOpen(true);
    setMessage(""); // 모달을 열 때 이전 메시지 초기화
    setIsPasswordChangeSuccess(false); // 비밀번호 변경 성공 상태 초기화
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setMessage(""); // 모달을 닫을 때 메시지 초기화
  };

  const closeSuccessPopup = () => {
    setIsSuccessPopupOpen(false); // 성공 팝업 닫기
    setIsPasswordChangeSuccess(false); // 상태 초기화하여 두 번째 모달 방지
    setMessage(""); // 메시지 초기화
  };

  return (
    <div>
      <h1>마이페이지</h1>
      <p>이메일: {userEmail}</p>

      <div>
        <label>닉네임: </label>
        {isEditingUsername ? (
          <>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button onClick={handleUsernameSave}>저장</button>
            <button onClick={() => setIsEditingUsername(false)}>취소</button>
          </>
        ) : (
          <>
            <span>{username}</span>
            <button onClick={() => setIsEditingUsername(true)}>수정</button>
          </>
        )}
      </div>

      <div>
        <button onClick={openPasswordModal}>비밀번호 수정</button>
      </div>

      <Modal
        isOpen={isPasswordModalOpen}
        onRequestClose={closePasswordModal}
        contentLabel="비밀번호 변경"
        className="password-modal"
        overlayClassName="password-modal-overlay"
      >
        <h2>비밀번호 변경</h2>
        <form>
          {!isPasswordChangeSuccess ? (
            <>
              <input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
              <button type="button" onClick={handlePasswordChange}>
                비밀번호 변경
              </button>
            </>
          ) : (
            <p>{message}</p>
          )}
          {!isPasswordChangeSuccess && message && (
            <p className="modal-message">{message}</p>
          )}
          <button type="button" onClick={closePasswordModal}>
            취소
          </button>
        </form>
      </Modal>

      {/* 성공 팝업 모달 */}
      <Modal
        isOpen={isSuccessPopupOpen}
        onRequestClose={closeSuccessPopup}
        contentLabel="성공 메시지"
        className="success-popup-modal"
        overlayClassName="password-modal-overlay"
      >
        <h2>{message}</h2>
        <button type="button" onClick={closeSuccessPopup}>
          닫기
        </button>
      </Modal>
    </div>
  );
}

export default Mypage;
