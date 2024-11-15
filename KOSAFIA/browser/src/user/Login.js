import React, { useState } from "react"; // React에서 제공하는 useState 훅을 가져옵니다.
import axios from "axios"; // axios 모듈 추가
import { Link, useNavigate } from "react-router-dom"; // 페이지 이동을 위한 Link와 useNavigate를 가져옵니다.
import "../styles/components/Login.css";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBCol,
  MDBIcon,
  MDBInput,
} from "mdb-react-ui-kit"; // MDBootstrap UI Kit의 컴포넌트를 사용합니다.

function Login() {
  const [email, setEmail] = useState(""); // 사용자 이메일을 저장하는 상태
  const [password, setPassword] = useState(""); // 사용자 비밀번호를 저장하는 상태
  const [error, setError] = useState(""); // 오류 메시지를 저장하는 상태
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수
  const BASE_URL = process.env.REACT_APP_API_URL;
  // 서버 URL 환경 변수
  // const BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.1.119:8080";
  // const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
  //const BASE_URL = process.env.REACT_APP_API_URL || "https://ba09-115-90-99-121.ngrok-free.app";

  // 로그인 처리 함수
  const handleLogin = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    try {
      //  axios로 서버에 로그인 요청
      const response = await axios.post(
        `${BASE_URL}/api/user/login`, // 환경 변수 기반 URL 사용
        { email, password }, // 요청 데이터
        { withCredentials: true } // 쿠키 포함
      );
      if (response.status === 200) {
        console.log("로그인 성공");
        const userData = response.data; // 서버에서 반환된 사용자 정보
        // 사용자 정보를 sessionStorage에 저장
        sessionStorage.setItem("userData", JSON.stringify(userData));
        console.log("User information saved to sessionStorage:", userData);
        navigate("/TestLobby"); // 로그인 성공 시 페이지 이동
      }
    } catch (error) {
      console.error("로그인 오류:", error);

      if (error.response) {
        // 서버에서 반환한 오류 메시지 처리
        setError(error.response.data || "로그인 실패. 다시 시도하세요.");
      } else {
        setError("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <MDBContainer className="my-login-background">
      {" "}
      {/* 로그인 배경 컨테이너 */}
      <MDBCard className="common-card login-card d-flex flex-row">
        {" "}
        {/* 로그인 카드 스타일 */}
        <MDBCol md="6">
          {" "}
          {/* 왼쪽 이미지 영역 */}
          <MDBCardImage
            src={`${process.env.PUBLIC_URL}/img/loginmain.png`} // 이미지 경로 설정
            alt="login form" // 이미지 설명
            className="common-image"
          />
        </MDBCol>
        <MDBCol md="6" className="my-login-card-body">
          {" "}
          {/* 오른쪽 로그인 폼 영역 */}
          <MDBCardBody className="d-flex flex-column align-items-center">
            {" "}
            {/* 카드 내부 스타일 */}
            <div className="d-flex flex-row mt-2">
              {" "}
              {/* 로고와 제목 영역 */}
              <MDBIcon
                fas
                icon="cubes fa-3x me-3"
                style={{ color: "#ff6219" }} // 아이콘 스타일
              />
              <span className="h1 fw-bold">Login</span> {/* 로그인 제목 */}
            </div>
            <h5
              className="fw-normal my-4 pb-3"
              style={{ letterSpacing: "1px" }}
            >
              Sign into your account
            </h5>
            {/* 로그인 폼 */}
            <form onSubmit={handleLogin} className="w-100">
              {/* 이메일 입력 필드 */}
              <MDBInput
                wrapperClass="mb-4"
                type="email" // 이메일 타입 지정
                size="lg" // 입력 필드 크기 지정
                placeholder="Email address" // 입력 필드에 나타날 텍스트
                value={email} // 상태값
                onChange={(e) => setEmail(e.target.value)} // 이메일 입력 시 상태 업데이트
                required // 필수 입력 항목
              />
              <MDBInput
                wrapperClass="mb-4"
                type="password" // 비밀번호 타입 지정
                size="lg" // 입력 필드 크기
                placeholder="Password" // 입력 필드에 나타날 텍스트
                value={password} // 상태값
                onChange={(e) => setPassword(e.target.value)} // 입력 값 변경 시 상태 업데이트
                required // 필수 입력 항목
              />

              {/* 오류 메시지 표시 */}
              {error && <p className="text-danger mb-3">{error}</p>}
              <button
                className="mb-4 px-5"
                style={{
                  background: "linear-gradient(to right, #ff416c, #ff4b2b)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  width: "100%",
                  maxWidth: "400px",
                  height: "50px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={handleLogin}
              >
                Login
              </button>
              <hr />
            </form>
            {/* Google 로그인 버튼 */}
            <a
              href={`${BASE_URL}/oauth2/authorization/google`} // Google OAuth2 URL로 리디렉션
              className="google-login-btn"
            >
              <i className="fab fa-google me-2"></i>Sign in with Google
            </a>
            <p className="mt-3 mb-5">
              Don't have an account?{" "}
              <Link to="/register" className="text-muted">
                Sign Up
              </Link>
            </p>
          </MDBCardBody>
        </MDBCol>
      </MDBCard>
    </MDBContainer>
  );
}

export default Login;
