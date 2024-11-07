import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // 리디렉션을 위해 useNavigate 훅 사용
import "../styles/components/Login.css";

import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBIcon,
  MDBInput,
} from "mdb-react-ui-kit";  // MDBootstrap UI Kit을 사용해 스타일링된 컴포넌트를 가져옵니다.

function Register() {
  // 회원가입 폼의 입력 데이터를 관리하는 상태 변수들
  const [email, setEmail] = useState(""); // 이메일 상태
  const [username, setUsername] = useState("");// 닉네임 상태
  const [password, setPassword] = useState(""); // 비밀번호 상태
  const [confirmPassword, setConfirmPassword] = useState("");// 비밀번호 확인 상태
  const [error, setError] = useState("");// 오류 메시지 상태
  const navigate = useNavigate(); // 리디렉션을 위한 navigate 설정

  // 회원가입 요청을 처리하는 함수
  const handleRegister = async (e) => {
    e.preventDefault();// 폼 제출 시 페이지 새로고침 방지

    // 비밀번호와 비밀번호 확인이 일치하는지 확인
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");// 일치하지 않을 경우 오류 메시지 설정
      return; // 일치하지 않으면 함수 종료
    }

    const userData = { email, username, password };  // 서버에 전송할 회원가입 데이터

    try {
       // 회원가입 요청을 서버에 전송
      const response = await fetch("http://localhost:8080/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },// JSON 형식으로 데이터 전송
        body: JSON.stringify(userData), // userData를 JSON 형식으로 서버에 전송
      });

      if (response.ok) {
        console.log("회원가입 성공");
        navigate("/custom-login"); // 회원가입 후 로그인 페이지로 리디렉션
      } else {
        // 회원가입 실패 시 서버의 에러 메시지를 가져와 표시
        const errorData = await response.json();
        setError(errorData.message || "회원가입 실패. 다시 시도하세요.");
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      setError("회원가입 중 오류가 발생했습니다.");
    }

    setPassword(""); // 폼 제출 후 비밀번호 초기화
    setConfirmPassword(""); // 폼 제출 후 비밀번호 확인 초기화
  };

  return (
    <MDBContainer className="login-background">
      <MDBCard className="login-card d-flex flex-row">
        {/* 왼쪽에 표시될 이미지 */}
        <MDBCol md="6">
          <MDBCardImage
            src={`${process.env.PUBLIC_URL}/img/초딩마피아.jpg`}
            alt="register form"
            className="login-image"
          />
        </MDBCol>
        {/* 오른쪽 회원가입 폼 영역 */}
        <MDBCol md="6" className="login-card-body">
          <MDBCardBody className="d-flex flex-column align-items-center">
            {/* 회원가입 폼 제목 */}
            <div className="d-flex flex-row mt-2">
              <MDBIcon
                fas
                icon="user-plus fa-3x me-3"
                style={{ color: "#ff6219" }}
              />
              <span className="h1 fw-bold">Register</span>
            </div>
            <h5
              className="fw-normal my-4 pb-3"
              style={{ letterSpacing: "1px" }}
            >
              Create your account
            </h5>

            {/* 회원가입 폼 */}
            <form onSubmit={handleRegister} className="w-100">
              {/* 이메일 입력 필드 */}
              <MDBInput
                wrapperClass="mb-4"
                type="email"
                size="lg"
                placeholder="이메일주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // 입력할 때마다 상태 업데이트
                required
              />
              {/* 닉네임 입력 필드 */}
              <MDBInput
                wrapperClass="mb-4"
                type="text"
                size="lg"
                placeholder="닉네임"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <MDBInput
                wrapperClass="mb-4"
                type="password"
                size="lg"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <MDBInput
                wrapperClass="mb-4"
                type="password"
                size="lg"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {/* 에러 메시지 표시 */}
              {error && <p className="text-danger mb-3">{error}</p>}
              {/* 회원가입 버튼 */}
              <MDBBtn
                color="dark"
                type="submit"
                className="mb-4 px-5"
                size="lg"
              >
                회원가입
              </MDBBtn>
            </form>

            {/* 로그인 페이지로 이동 링크 */}
            <p className="mt-3 mb-5">
              이미 계정이 있으신가요?{" "}
              <Link to="/custom-login" className="text-muted">
                로그인
              </Link>
            </p>

            {/* 하단 약관과 정책 링크 (예시) */}
            <div className="d-flex flex-row justify-content-start w-100">
              <a href="#!" className="small text-muted me-1">
                Terms of use.
              </a>
              <a href="#!" className="small text-muted">
                Privacy policy
              </a>
            </div>
          </MDBCardBody>
        </MDBCol>
      </MDBCard>
    </MDBContainer>
  );
}

export default Register;
