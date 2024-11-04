import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom"; // 로그인 화면으로 이동하기 위해 useNavigate 사용
import "../styles/components/Mypage.css";

Modal.setAppElement("#root");

function Mypage() {
  const [userEmail, setUserEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false); // 닉네임 편집 모드 여부
  const [currentPassword, setCurrentPassword] = useState(""); // 현재 비밀번호 상태
  const [newPassword, setNewPassword] = useState(""); // 새 비밀번호 상태
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // 새 비밀번호 확인 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // 비밀번호 변경 모달 열림 여부
  const [message, setMessage] = useState(""); // 메시지 상태 (성공/오류 메시지 표시)
  const [isPasswordChangeSuccess, setIsPasswordChangeSuccess] = useState(false); // 비밀번호 변경 성공 여부
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false); // 성공 팝업 모달 열림 여부
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // 회원탈퇴 모달 열림 여부
  const [deletePassword, setDeletePassword] = useState(""); // 회원탈퇴 시 입력할 비밀번호

  const navigate = useNavigate(); // 로그인 화면으로 이동하기 위해 navigate 설정

  // 사용자 정보를 서버에서 가져오는 함수
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

    fetchUserProfile(); // 컴포넌트가 렌더링될 때 사용자 정보 가져오기
  }, []);

  // 닉네임 저장 함수
  const handleUsernameSave = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/user/update-username",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username }), // 새 닉네임을 서버에 전송
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

  // 비밀번호 변경 함수
  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      // 새 비밀번호와 확인 비밀번호가 다를 때
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
          body: JSON.stringify({ currentPassword, newPassword }), // 서버에 현재 비밀번호와 새 비밀번호 전송
        }
      );

      if (response.ok) {
        setMessage("비밀번호가 성공적으로 변경되었습니다.");
        setIsPasswordChangeSuccess(true); // 변경 성공 상태 설정
        setIsPasswordModalOpen(false); // 모달 닫기
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

  // 회원탈퇴 처리 함수
  const handleAccountDeletion = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: deletePassword }), // 회원탈퇴 시 비밀번호 전송
      });

      if (response.ok) {
        setMessage("회원탈퇴가 성공적으로 완료되었습니다.");
        setIsDeleteModalOpen(false);
        setIsSuccessPopupOpen(true); // 성공 팝업 열기
      } else {
        setMessage("회원탈퇴에 실패했습니다. 비밀번호를 확인해주세요.");
      }
    } catch (error) {
      console.error("회원탈퇴 오류:", error);
      setMessage("회원탈퇴 중 오류가 발생했습니다.");
    }
  };
  // 비밀번호 변경 모달 열기
  const openPasswordModal = () => {
    setIsPasswordModalOpen(true); // 비밀번호 변경 모달 열림
    setMessage(""); // 메시지 초기화
    setIsPasswordChangeSuccess(false); // 성공 상태 초기화
  };
  // 회원탈퇴 모달 열기
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true); // 회원탈퇴 모달 열림
    setDeletePassword(""); // 비밀번호 초기화
    setMessage(""); // 메시지 초기화
  };
  // 비밀번호 변경 모달 닫기
  const closePasswordModal = () => {
    setIsPasswordModalOpen(false); // 비밀번호 변경 모달 닫기
    setCurrentPassword(""); // 현재 비밀번호 초기화
    setNewPassword(""); // 새 비밀번호 초기화
    setConfirmNewPassword(""); // 새 비밀번호 확인 초기화
    setMessage(""); // 메시지 초기화
  };
  // 회원탈퇴 모달 닫기
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false); // 회원탈퇴 모달 닫기
    setDeletePassword(""); // 비밀번호 초기화
    setMessage(""); // 메시지 초기화
  };
  // 성공 팝업 닫기
  const closeSuccessPopup = () => {
    setIsSuccessPopupOpen(false); // 성공 팝업 모달 닫기
    setIsPasswordChangeSuccess(false); // 비밀번호 변경 성공 초기화
    setMessage(""); // 메시지 초기화
    navigate("/custom-login"); // 성공 팝업 닫을 때 로그인 화면으로 이동
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
        <button onClick={openDeleteModal}>회원탈퇴</button>
      </div>

      {/* 비밀번호 변경 모달 */}
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

      {/* 회원탈퇴 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="회원탈퇴"
        className="password-modal"
        overlayClassName="password-modal-overlay"
      >
        <h2>회원탈퇴</h2>
        <p>계정을 삭제하려면 비밀번호를 입력하세요.</p>
        <input
          type="password"
          placeholder="비밀번호"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          required
        />
        <button type="button" onClick={handleAccountDeletion}>
          회원탈퇴
        </button>
        <button type="button" onClick={closeDeleteModal}>
          취소
        </button>
        {message && <p className="modal-message">{message}</p>}
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
