import React, { useState } from "react"; // React와 useState 훅을 가져옵니다.
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

  // 로그인 처리 함수
  const handleLogin = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    try {
      // 서버에 로그인 요청
      const response = await fetch("http://localhost:8080/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // JSON 형식으로 email과 password를 서버에 전송
        credentials: "include", // 세션 쿠키를 포함하여 요청
      });

      if (response.ok) {
        navigate("/LoginOk"); // 로그인 성공 시 LoginOk 페이지로 리디렉션
      } else {
        const errorData = await response.text();
        setError(errorData || "로그인 실패. 다시 시도하세요.");
      }
    } catch (error) {
      console.error("로그인 오류:", error); // 콘솔에 오류 메시지 출력
      setError("로그인 중 오류가 발생했습니다."); // 오류 메시지를 사용자에게 표시
    }
  };

  return (
    <MDBContainer className="login-background">
      {" "}
      {/* 로그인 배경 컨테이너 */}
      <MDBCard className="login-card d-flex flex-row">
        {" "}
        {/* 로그인 카드 스타일 */}
        <MDBCol md="6">
          {" "}
          {/* 왼쪽 이미지 영역 */}
          <MDBCardImage
            src={`${process.env.PUBLIC_URL}/img/초딩마피아.jpg`}
            alt="login form"
            className="login-image"
          />
        </MDBCol>
        <MDBCol md="6" className="login-card-body">
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
                type="email"
                size="lg"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // 이메일 입력 시 상태 업데이트
                required
              />
              <MDBInput
                wrapperClass="mb-4"
                type="password"
                size="lg"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* 오류 메시지 표시 */}
              {error && <p className="text-danger mb-3">{error}</p>}
              <MDBBtn
                color="dark"
                type="submit"
                className="mb-4 px-5"
                size="lg"
              >
                Login
              </MDBBtn>
            </form>
            <p className="mt-3 mb-5">
              계정이 없으신가요?{" "}
              <Link to="/register" className="text-muted">
                회원가입
              </Link>
            </p>
          </MDBCardBody>
        </MDBCol>
      </MDBCard>
    </MDBContainer>
  );
}

export default Login;
