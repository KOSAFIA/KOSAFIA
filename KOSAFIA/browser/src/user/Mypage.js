import React, { useEffect, useState } from "react"; // React에서 제공하는 useEffect와 useState 훅을 임포트하여 상태 관리와 라이프 사이클 관리를 하기 위함
import Modal from "react-modal"; // 모달을 구현하기 위한 라이브러리 Modal을 임포트
import { useNavigate } from "react-router-dom"; // 로그인 화면으로  페이지 이동을 위해 useNavigate 사용
import "../styles/components/Mypage.css";

Modal.setAppElement("#root"); // Modal 라이브러리가 접근할 앱 루트를 설정

function Mypage({ setUsername, isOAuthUser, setIsOAuthUser }) {
  // isOAuthUser를 상위 컴포넌트에서 props로 전달받아 사용}) {
  // 상위 컴포넌트에서 setUsername 과 isOAuthUser을 props로 전달받아 사용
  const [userEmail, setUserEmail] = useState(""); // 사용자 이메일 상태 관리
  const [username, setLocalUsername] = useState(""); // 로컬에서 사용하는 닉네임 상태 관리
  const [isEditingUsername, setIsEditingUsername] = useState(false); // 닉네임 편집 모드 여부 상태 관리

  const [message, setMessage] = useState(""); // 메시지 상태 (성공/오류 메시지 표시)
  const [nicknameMessage, setNicknameMessage] = useState(""); // 닉네임 변경 메시지
  const [passwordMessage, setPasswordMessage] = useState(""); // 비밀번호 변경 메시지
  const [accountMessage, setAccountMessage] = useState(""); // 회원탈퇴 메시지

  const [isNicknameSuccessPopupOpen, setIsNicknameSuccessPopupOpen] =
    useState(false); // 닉네임 변경 성공 팝업 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // 비밀번호 변경 모달 열림 여부
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // 회원탈퇴 모달 열림 여부
  const [isOAuthDeleteModalOpen, setIsOAuthDeleteModalOpen] = useState(false); // OAuth 사용자를 위한 회원탈퇴 모달 열림 여부

  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false); // 성공 팝업 모달 열림 여부
  const [isPasswordChangeSuccess, setIsPasswordChangeSuccess] = useState(false); // 비밀번호 변경 성공 여부

  const [currentPassword, setCurrentPassword] = useState(""); // 현재 비밀번호 상태
  const [newPassword, setNewPassword] = useState(""); // 새 비밀번호 상태
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // 새 비밀번호 확인 상태
  const [deletePassword, setDeletePassword] = useState(""); // 회원탈퇴 시 입력할 비밀번호
  const [confirmDeletionInput, setConfirmDeletionInput] = useState(""); // 회원탈퇴 확인 입력 상태

  const [isDuplicateUsernamePopupOpen, setIsDuplicateUsernamePopupOpen] =
    useState(false); // 중복 닉네임 팝업 상태 관리

  const BASE_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate(); // 로그인 화면으로 이동하기 위해 navigate 설정

  // 사용자 정보를 서버에서 가져오는 함수
  useEffect(() => {
    console.log("isOAuthUser 상태가 변경되었습니다:", isOAuthUser);
  }, [isOAuthUser]);

  // 사용자 정보를 서버에서 가져오는 함수
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/user/profile`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 쿠키 등 인증 정보를 포함하여 서버에 요청
        });

        if (response.ok) {
          const data = await response.json(); // 서버로부터 받은 데이터를 JSON 형태로 파싱
          console.log("받아온 사용자 정보:", data); // 받아온 사용자 정보 로그로 확인

          // 사용자 상태 업데이트
          setUserEmail(data.user_email); // 사용자 이메일 상태 업데이트
          setLocalUsername(data.username); // 사용자 닉네임 상태 업데이트

          // OAuth 사용자 여부 판단
          const isOAuth = data.provider === "google";
          setIsOAuthUser(isOAuth);
          console.log(
            isOAuth ? "OAuth 사용자 설정 완료" : "일반 사용자 설정 완료"
          );

          // console.log("OAuth 사용자 여부:", data.provider === "google");
        } else {
          console.error("사용자 정보를 불러오는 데 실패했습니다."); // 서버 응답 실패 시 오류 메시지 출력
        }
      } catch (error) {
        console.error("사용자 정보 로드 오류:", error);
      }
    };

    fetchUserProfile(); // 컴포넌트가 렌더링될 때 사용자 정보 가져오기
  }, [setIsOAuthUser]); // 의존성 배열에 상태 업데이트 함수를 추가

  // 닉네임 저장 함수
  const handleUsernameSave = async () => {
    try {
      // 1. 닉네임 중복 확인
      const duplicateCheckResponse = await fetch(
        `${BASE_URL}/api/user/check-username?username=${username}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const duplicateCheckData = await duplicateCheckResponse.json();
      console.log("중복 체크 데이터:", duplicateCheckData); // 데이터 확인용 로그

      if (!duplicateCheckData.available) {
        // 2. 중복된 닉네임이 있을 경우
        setIsDuplicateUsernamePopupOpen(true); // 중복된 닉네임 팝업 열기

        return; // 더 이상 진행하지 않고 함수 종료
      }

      // 3. 중복되지 않으면 닉네임 변경 요청
      const response = await fetch(`${BASE_URL}/api/user/update-username`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 인증 정보 포함
        body: JSON.stringify({ username: username }), // 변경할 닉네임
      });

      if (response.ok) {
        // 닉네임 변경 성공
        setIsNicknameSuccessPopupOpen(true); // 성공 팝업 열기
        setMessage("닉네임이 성공적으로 변경되었습니다.");
        setIsEditingUsername(false); // 편집 모드 종료
        setUsername(username); // 상위 컴포넌트에서 전달된 setUsername으로 상태 업데이트
      } else {
        // 닉네임 변경 실패
        const data = await response.json();
        setMessage("닉네임 변경에 실패했습니다.");
        if (data?.error === "duplicate") {
          setIsDuplicateUsernamePopupOpen(true); // 중복 닉네임 오류 처리
        }
      }
    } catch (error) {
      console.error("닉네임 수정 오류:", error);
      setMessage("닉네임 변경 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    console.log(
      "isDuplicateUsernamePopupOpen 상태:",
      isDuplicateUsernamePopupOpen
    );
  }, [isDuplicateUsernamePopupOpen]);

  // 비밀번호 변경 함수
  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      // 새 비밀번호와 확인 비밀번호가 다를 때
      setPasswordMessage(
        "setPasswordMessage 새 비밀번호가 일치하지 않습니다.handlePasswordChange"
      );
      setMessage(
        "setMessage 새 비밀번호가 일치하지 않습니다.handlePasswordChange"
      );
      setIsPasswordChangeSuccess(false); // 비밀번호 변경 실패 상태 설정
      return; // 함수 종료
    }

    try {
      const response = await fetch(`${BASE_URL}/api/user/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 쿠키 등 인증 정보를 포함하여 서버에 요청
        body: JSON.stringify({ currentPassword, newPassword }), // 서버에 현재 비밀번호와 새 비밀번호 전송
      });

      if (response.ok) {
        setMessage(
          "🎉 비밀번호 변경 완료! 새로운 비밀번호로 다시 로그인하세요 🔒 "
        ); // 성공 메시지 설정
        //setPasswordMessage(
        // "setPasswordMessage비밀번호가 성공적으로 변경되었습니다."
        // );
        //   setIsPasswordChangeSuccess(true); // 비밀번호 변경 성공 상태 설정
        setIsPasswordModalOpen(false); // 비밀번호 변경 모달 닫기
        setIsSuccessPopupOpen(true); // 성공 팝업 열기
      } else {
        setPasswordMessage("setPasswordMessage비밀번호 변경에 실패했습니다.");
        //   setMessage("setMessage비밀번호 변경에 실패했습니다."); // 실패 메시지 설정
        //   setIsPasswordChangeSuccess(false); // 비밀번호 변경 실패 상태 설정
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error); // 네트워크 오류 등 예외 처리
      setPasswordMessage(
        "setPasswordMessage 비밀번호 변경 중 오류가 발생했습니다."
      );
      //  setMessage("setMessage 비밀번호 변경 중 오류가 발생했습니다."); // 오류 메시지 설정
      // setIsPasswordChangeSuccess(false); // 비밀번호 변경 실패 상태 설정
    }
  };

  // 회원탈퇴 처리 함수
  const handleAccountDeletion = async () => {
    try {
      const endpoint = `${BASE_URL}/api/user/delete`;
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          password: isOAuthUser ? null : deletePassword,
          isOAuthUser: isOAuthUser,
        }),
      });

      if (response.ok) {
        setAccountMessage(
          "setAccountMessage회원탈퇴가 성공적으로 완료되었습니다."
        );
        setMessage("회원탈퇴가 성공적으로 완료되었습니다.");
        setIsDeleteModalOpen(false);
        setIsOAuthDeleteModalOpen(false);
        setIsSuccessPopupOpen(true);
        navigate("/custom-login");
      } else {
        setAccountMessage(
          "비밀번호가 틀려 회원탈퇴에 실패했습니다. 다시 시도해주세요."
        );
        // setMessage("setMessage 회원탈퇴에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("회원탈퇴 오류:", error);
      setAccountMessage("setAccountMessage 회원탈퇴 중 오류가 발생했습니다.");
      setMessage("setMessage 회원탈퇴 중 오류가 발생했습니다.");
    }
  };

  // 비밀번호 변경 모달 열기
  const openPasswordModal = () => {
    setIsPasswordModalOpen(true); // 비밀번호 변경 모달 열림 상태로 설정
    setMessage(""); // 메시지 초기화
    setIsPasswordChangeSuccess(false); // 비밀번호 변경 성공 상태 초기화
  };
  // 회원탈퇴 모달 열기
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true); // 회원탈퇴 모달 열림 상태로 설정
    setDeletePassword(""); // 비밀번호 입력 상태 초기화
    setMessage(""); // 메시지 초기화
  };
  // 비밀번호 변경 모달 닫기
  const closePasswordModal = () => {
    setIsPasswordModalOpen(false); // 비밀번호 변경 모달 닫기
    setCurrentPassword(""); // 현재 비밀번호 초기화
    setNewPassword(""); // 새 비밀번호 초기화
    setConfirmNewPassword(""); // 새 비밀번호 확인 초기화
    setMessage(""); // 메시지 초기화
    setPasswordMessage("");
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
    navigate("/custom-login"); // 성공 팝업 닫을 때 로그인 화면으로 이동
    //setIsPasswordChangeSuccess(false); // 비밀번호 변경 성공 초기화
    //  setMessage(""); // 메시지 초기화
    // navigate("/custom-login"); // 성공 팝업 닫을 때 로그인 화면으로 이동
  };

  // OAuth 사용자를 위한 회원탈퇴 모달 열기
  const openOAuthDeleteModal = () => {
    console.log("openOAuthDeleteModal 호출됨"); // 함수가 호출되었는지 확인
    setIsOAuthDeleteModalOpen(true); // OAuth 회원탈퇴 모달 열림 상태로 설정
    console.log("isOAuthDeleteModalOpen 상태:", true); // 상태가 변경되었음을 로그로 확인
    setConfirmDeletionInput(""); // 확인 입력 초기화
    setMessage(""); // 메시지 초기화
  };
  // OAuth 회원탈퇴 모달 닫기
  const closeOAuthDeleteModal = () => {
    setIsOAuthDeleteModalOpen(false); // OAuth 회원탈퇴 모달

    setMessage(""); // 메시지 초기화
  };
  // 닉네임 성공 팝업 닫기
  const closeNicknameSuccessPopup = () => {
    setIsNicknameSuccessPopupOpen(false); // 닉네임 성공 팝업 닫기
    setMessage("");
  };
  // 닉네임 중복 팝업 닫기 함수
  const closeDuplicateUsernamePopup = () => {
    setIsDuplicateUsernamePopupOpen(false); // 팝업 닫기
  };
  return (
    <div>
      <h1>Mapage</h1>
      <p>이메일: {userEmail}</p>

      <div>
        <label>닉네임: </label>
        {isEditingUsername ? (
          // 닉네임 수정 모드일 때
          <>
            <input
              type="text"
              value={username} // 현재 닉네임 값 표시
              onChange={(e) => setLocalUsername(e.target.value)} // 사용자가 입력한 값을 로컬 상태에 저장
              className="username-text"
              required
            />
            <div className="username-button-container">
              <button
                className="username-save-button"
                onClick={handleUsernameSave}
              >
                저장
              </button>
              <button
                className="username-cancel-button"
                onClick={() => setIsEditingUsername(false)}
              >
                취소
              </button>
            </div>
          </>
        ) : (
          // 닉네임 보기 모드일 때
          <>
            <span>{username}</span> {/* 현재 닉네임 표시 */}
            <button
              className="username-edit-button"
              onClick={() => setIsEditingUsername(true)}
            >
              수정
            </button>
          </>
        )}
        {nicknameMessage && <p>{nicknameMessage}</p>}

        {/* 닉네임 변경 성공 팝업 */}
        <Modal
          isOpen={isNicknameSuccessPopupOpen} // 닉네임 변경 성공 팝업 열림 여부
          onRequestClose={closeNicknameSuccessPopup} // 팝업 닫기 함수
          contentLabel="닉네임 변경 성공" // 팝업 설명
          className="username-success-popup-modal" // 팝업 스타일 클래스
          overlayClassName="username-success-popup-modal-overlay" // 팝업 오버레이 스타일 클래스
          portalClassName="ReactModalPortal"
        >
          <h2>닉네임 변경 성공!</h2>
          <p>{message}</p> {/* 성공 메시지 표시 */}
          <button onClick={closeNicknameSuccessPopup}>닫기</button>
        </Modal>

        {/* 중복 닉네임 경고 팝업 */}
        <Modal
          isOpen={isDuplicateUsernamePopupOpen} // 중복 닉네임 팝업 열림 여부
          onRequestClose={closeDuplicateUsernamePopup} // 팝업 닫기 함수
          contentLabel="중복 닉네임 경고"
          className="username-error-popup-modal"
          overlayClassName="username-error-popup-modal-overlay"
          portalClassName="ReactModalPortal"
        >
          <h2>닉네임이 중복되었습니다!</h2>
          <p>사용할 수 없는 닉네임입니다. 다른 닉네임을 시도해주세요.</p>
          <button onClick={closeDuplicateUsernamePopup}>닫기</button>
        </Modal>
      </div>

      {/* 비밀번호 수정 버튼: OAuth 사용자에게는 비활성화됨 */}
      <div>
        <div className="mypage-password-action-button-container">
          {!isOAuthUser && (
            <div>
              <button
                className="mypage-password-action-button"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                비밀번호 수정
              </button>
            </div>
          )}
          {/* 회원탈퇴 버튼: OAuth 사용자에게는 보이지 않음 */}
          <div>
            <button
              type="button"
              onClick={isOAuthUser ? openOAuthDeleteModal : openDeleteModal}
            >
              회원탈퇴
            </button>
          </div>

          {/* 비밀번호 변경 모달 */}
          <Modal
            isOpen={isPasswordModalOpen} // 모달이 열려 있는지 여부
            // onRequestClose={closePasswordModal} // 모달 닫기 함수
            onRequestClose={() => setIsPasswordModalOpen(false)} // 모달 닫기
            contentLabel="비밀번호 변경" // 모달 내용 설명
            className="mypage-password-modal" // 모달의 스타일 지정 클래스
            overlayClassName="mypage-password-modal-overlay" // 모달 오버레이의 스타일 지정 클래스
            portalClassName="ReactModalPortal" // 최상단 계층에서 렌더링
          >
            <h2>비밀번호 변경</h2>
            <form>
              {/* 비밀번호 변경 성공 여부에 따른 화면 분기 */}
              {!isPasswordChangeSuccess ? (
                // 비밀번호 변경 폼
                <>
                  <input
                    type="password"
                    placeholder="현재 비밀번호"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)} // 현재 비밀번호 입력값 업데이트
                    required
                  />
                  <br></br>
                  <input
                    type="password"
                    placeholder="새 비밀번호"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} // 새 비밀번호 입력값 업데이트
                    required
                  />
                  <input
                    type="password"
                    placeholder="새 비밀번호 확인"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)} // 새 비밀번호 확인 입력값 업데이트
                    required
                  />
                  <br></br>
                  <button type="button" onClick={handlePasswordChange}>
                    {/* 비밀번호 변경 요청 버튼 */}
                    비밀번호 변경
                  </button>
                  {passwordMessage && <p>{passwordMessage}</p>}
                </>
              ) : (
                // 비밀번호 변경 성공 시 메시지 표시
                <p>{message}</p>
              )}
              <Modal
                isOpen={isSuccessPopupOpen} // 성공 팝업 열림 여부
                onRequestClose={closeSuccessPopup} // 팝업 닫기
                contentLabel="성공 메시지"
                className="success-popup-modal"
                overlayClassName="success-popup-modal-overlay"
              >
                <h2>비밀번호 변경이 완료되었습니다!</h2> {/* 성공 메시지 */}
                <button type="button" onClick={closeSuccessPopup}>
                  확인
                </button>
              </Modal>

              {!isPasswordChangeSuccess && message && (
                // 비밀번호 변경 실패 시 메시지 표시
                <p className="modal-message">{message}</p>
              )}
              <button type="button" onClick={closePasswordModal}>
                취소
              </button>
            </form>
          </Modal>
          {/* 회원탈퇴 모달 */}
          <Modal
            isOpen={isDeleteModalOpen || isOAuthDeleteModalOpen} // 모달이 열려 있는지 여부
            onRequestClose={
              isOAuthUser ? closeOAuthDeleteModal : closeDeleteModal
            } // 모달 닫기 함수
            contentLabel="회원탈퇴" // 모달 내용 설명
            className="password-delete-modal" // 모달의 스타일 지정 클래스
            overlayClassName="password-delete-modal-overlay" // 모달 오버레이의 스타일 지정 클래스
            portalClassName="ReactModalPortal" // 최상단 계층에서 렌더링
          >
            <h2>회원탈퇴</h2>
            {isOAuthUser ? (
              // OAuth 사용자 탈퇴 모달
              <>
                <p>계정을 삭제하려면 "탈퇴 원합니다"를 입력하세요.</p>
                <input
                  type="text"
                  placeholder="탈퇴 원합니다"
                  value={confirmDeletionInput}
                  onChange={(e) => setConfirmDeletionInput(e.target.value)} // 확인 입력 업데이트
                  required
                />
              </>
            ) : (
              // 일반 사용자 탈퇴 모달
              <>
                <p>계정을 삭제하려면 비밀번호를 입력하세요.</p>
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)} // 회원탈퇴 시 비밀번호 입력값 업데이트
                  required
                />
              </>
            )}
            <button type="button" onClick={handleAccountDeletion}>
              {" "}
              {/* 회원탈퇴 요청 버튼 */}
              회원탈퇴
            </button>
            {accountMessage && <p>{accountMessage}</p>}
            <button
              type="button"
              onClick={isOAuthUser ? closeOAuthDeleteModal : closeDeleteModal}
            >
              취소
            </button>

            {message && <p className="modal-message">{message}</p>}
            {/* 상태 메시지 표시 */}
          </Modal>
        </div>
      </div>
      {/* 성공 팝업 모달 */}
      <Modal
        isOpen={isSuccessPopupOpen} // 성공 팝업 모달 열림 여부
        onRequestClose={closeSuccessPopup} // 팝업 모달 닫기 함수
        contentLabel="성공 메시지" // 모달 내용 설명
        className="success-popup-modal" // 모달의 스타일 지정 클래스
        overlayClassName="password-modal-overlay" // 모달 오버레이의 스타일 지정 클래스
      >
        <h2>{message}</h2> {/* 성공 메시지 표시 */}
        <button
          className="all-close-button"
          type="button"
          onClick={closeSuccessPopup}
        >
          닫기
        </button>
      </Modal>
    </div>
  );
}

export default Mypage;
