import React, { useEffect, useState } from "react"; // React에서 제공하는 useEffect와 useState 훅을 가져옵니다.
import CheckCors from "../utils/CheckCors"; // CORS 확인을 위한 유틸리티 함수를 가져옵니다.
import Modal from "react-modal"; // 모달을 구현하기 위한 라이브러리 Modal을 임포트합니다.
import Mypage from "./Mypage"; // 마이페이지 컴포넌트를 가져옵니다.
import GameRoom from "../pages/GameRoom"; // 게임방 페이지 컴포넌트를 가져옵니다.
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위해 useNavigate 훅을 가져옵니다.
import axios from "axios"; // 서버와의 통신을 위해 axios 라이브러리를 가져옵니다.

import "../styles/components/LoginOk.css";

Modal.setAppElement("#root"); // 모달이 열릴 때 #root 외부의 콘텐츠는 접근 불가로 설정합니다.

function LoginOk() {
  const [username, setUsername] = useState(""); // 사용자 닉네임 저장하는 상태입니다.
  const [useremail, setUserEmail] = useState(""); // 사용자 이메일 저장하는 상태입니다.
  const [isMypageModalOpen, setIsMypageModalOpen] = useState(false); // 마이페이지 모달 열림 상태
  const [isOAuthUser, setIsOAuthUser] = useState(false); // OAuth 사용자 여부를 저장하는 상태 정의
  const BASE_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수입니다.
  // 서버 URL 환경 변수
  // const BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.1.119:8080";
  // const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
  //const BASE_URL = process.env.REACT_APP_API_URL || "https://ba09-115-90-99-121.ngrok-free.app";

  // Google API 초기화
  useEffect(() => {
    const loadGoogleAPI = () => {
      if (window.gapi) {
        // gapi가 로드되었는지 확인 후 초기화
        window.gapi.load("auth2", () => {
          window.gapi.auth2
            .init({
              client_id:
                "5276016200-0akrpvkqj25ibt4pufasavlceldkgmpn.apps.googleusercontent.com", // Google 클라이언트 ID
            })
            .then(() => {
              console.log("Google API 초기화 성공");
            })
            .catch((error) => {
              console.error("Google API 초기화 중 오류 발생:", error);
            });
        });
      } else {
        console.error("Google API가 로드되지 않았습니다.");
      }
    };

    // Google API 로드 상태 확인
    if (!window.gapi) {
      const interval = setInterval(() => {
        if (window.gapi) {
          clearInterval(interval); // gapi 로드 확인 후 interval 제거
          loadGoogleAPI();
        }
      }, 100); // 100ms 간격으로 Google API 로드 확인
    } else {
      loadGoogleAPI();
    }
  }, []);

  //김남영 추가 :: 세션에서 사용자 데이터 가져오기 무조건 한번 페이지 로드시 실행
  // 컴포넌트가 마운트될 때 세션 데이터를 가져옵니다
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // withCredentials: true를 설정하여 쿠키와 함께 요청을 보냅니다
        const response = await axios.get(
          `${BASE_URL}/api/user/response-userData`,
          // "http://192.168.1.119:8080/api/user/response-userData",
          {
            withCredentials: true,
          }
        );

        // 사용자 데이터 초기화
        const userData = response.data;

        // 사용자 데이터 상태 업데이트
        sessionStorage.setItem("userData", JSON.stringify(userData));

        setUsername(userData.username);
        setUserEmail(userData.userEmail);

        // provider 값에 따라 OAuth 여부 설정
        const isOAuth = userData.provider === "google";
        setIsOAuthUser(isOAuth);

        // console.log("사용자 데이터 로드 성공:", userData);
        // console.log("OAuth 사용자 여부:", isOAuth);
      } catch (error) {
        console.error("사용자 데이터를 가져오는데 실패했어요:", error);
        // navigate("/custom-login"); // 오류 발생 시 로그인 페이지로 이동
      }
    };

    fetchUserData(); // 사용자 데이터를 가져오는 함수를 호출합니다.
  }, [navigate]); // navigate가 변경될 때 이 효과가 다시 실행됩니다.

  // // 컴포넌트가 처음 렌더링될 때 사용자 정보를 가져오는 함수입니다.
  // useEffect(() => {
  //   // 로그인한 사용자 정보 가져오기와 CORS 확인
  //   const fetchUserInfo = async () => {
  //     try {
  //       await CheckCors(); // CORS 확인을 위해 CheckCors 호출

  //       const response = await fetch(
  //         `${BASE_URL}/api/user/profile`,

  //         //"http://192.168.1.119:8080/api/user/profile",
  //         {
  //           method: "GET",
  //           headers: { "Content-Type": "application/json" },
  //           credentials: "include", // 세션 쿠키를 포함하여 서버에 요청
  //         }
  //       );

  //       if (response.ok) {
  //         const data = await response.json(); // 서버로부터 받은 데이터를 JSON 형태로 파싱
  //         console.log("받은 사용자 데이터:", data); // 데이터 확인 로그 추가
  //         setUserEmail(data.useremail); // 사용자 이메일 상태 업데이트
  //         setUsername(data.username); // 사용자 닉네임 상태를 업데이트합니다.
  //         setIsOAuthUser(!!data.provider); // provider 필드가 있으면 OAuth 사용자임을 true로 설정
  //       } else {
  //         console.error("사용자 정보를 불러오는 데 실패했습니다.");
  //         navigate("/custom-login"); // 로그인 실패 시 로그인 페이지로 리디렉션
  //       }
  //     } catch (error) {
  //       console.error("사용자 정보 로드 오류:", error);
  //       navigate("/custom-login"); // 오류 발생 시 로그인 페이지로 리디렉션
  //     }
  //   };
  // 사용자 정보를 가져오는 함수 (fetchUserInfo)
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/user/profile`, {
          withCredentials: true, // 쿠키 포함
        });

        if (response.status === 200) {
          const data = response.data; // 응답 데이터
          // console.log("받은 사용자 데이터:", data);

          // 사용자 상태 업데이트
          setUsername(data.username);
          setUserEmail(data.user_email);

          // OAuth 사용자 여부 판단 및 설정
          const isOAuth = data.provider === "google";
          setIsOAuthUser(isOAuth);
          // console.log("OAuth 사용자 여부:", isOAuth);
        }
      } catch (error) {
        console.error("사용자 정보 로드 오류:", error);
        // navigate("/custom-login"); // 오류 발생 시 로그인 페이지로 이동
      }
    };

    fetchUserInfo(); // 사용자 정보를 가져오는 함수를 호출합니다.
  }, [navigate]); // navigate 의존성을 추가하여 navigate 함수가 변경되면 useEffect가 다시 실행됩니다.

  // 로그아웃 핸들러 함수
  const handleLogout = async () => {
    try {
      if (isOAuthUser) {
        await fetch(`${BASE_URL}/api/user/google-logout`, { method: "POST" });
      }
      sessionStorage.clear();
      alert("로그아웃 되었습니다.77");
      navigate("/custom-login");
    } catch (error) {
      console.error("로그아웃 오류:77", error);
      alert("로그아웃 중 오류가 발생했습니다.77");
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

  // 게임방 페이지로 이동
  const goToGameRoom = () => {
    navigate("/GameRoom"); // 게임방 페이지로 이동
  };

  //김남영 추가 : 김지연 테스트로비로 이동
  const goToTestLobby = () => {
    navigate("/TestLobby");
  };
  //Google 로그아웃 연동
  const handleGoogleLogout = () => {
    const auth2 = window.gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
      console.log("Google 로그아웃 완료");
    });
  };
  return (
    <>
      <nav className="navbar">
        <h1>KOSAFIA</h1>
        {username && (
          <p className="welcome-message">{username}님, 환영합니다!</p>
        )}
        <div className="navbar-buttons">
          <button className="mypage-button" onClick={openMypageModal}>
            마이페이지
          </button>
          <button className="GameRoombutton" onClick={goToGameRoom}>
            게임방
          </button>
          <button className="TestLobbybutton" onClick={goToTestLobby}>
            테스트로비
          </button>
          <button className="logout-button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </nav>
      <Modal
        isOpen={isMypageModalOpen} // 모달 열림 여부를 결정하는 상태
        onRequestClose={closeMypageModal} // 모달 외부 클릭 시 닫히도록 설정
        contentLabel="마이페이지" // 접근성을 위한 모달 설명
        className="mypage-modal" // 모달 스타일 클래스
        overlayClassName="mypage-modal-overlay" // 모달 배경 스타일 클래스
      >
        <Mypage
          setUsername={setUsername}
          isOAuthUser={isOAuthUser} // 상태 전달
          setIsOAuthUser={setIsOAuthUser} // 상태 업데이트 함수 전달
        />
        {/* isOAuthUser를 Mypage에 전달 */}
        {/* setUsername을 Mypage에 전달 */}
        <button onClick={closeMypageModal} style={{ marginTop: "10px" }}>
          닫기
        </button>
      </Modal>
    </>
  );
}

export default LoginOk;
