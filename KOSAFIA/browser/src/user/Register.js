import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "mdb-react-ui-kit";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const navigate = useNavigate();

  // 서버 URL 환경 변수
  // const BASE_URL = process.env.REACT_APP_API_URL || "http://192.168.1.119:8080";
  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  // 이메일 중복 체크 함수
  const checkEmailAvailability = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/user/check-email?email=${email}`
      );
      const data = await response.json();
      setEmailAvailable(data.available);
    } catch (error) {
      console.error("이메일 중복 체크 오류:", error);
    }
  };

  // 닉네임 중복 체크 함수
  const checkUsernameAvailability = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/user/check-username?username=${username}`
      );
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error("닉네임 중복 체크 오류:", error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!emailAvailable) {
      setError("사용할 수 없는 이메일입니다.");
      return;
    }

    if (!usernameAvailable) {
      setError("사용할 수 없는 닉네임입니다.");
      return;
    }

    const userData = { email, username, password };

    try {
      const response = await fetch(`${BASE_URL}/api/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        console.log("회원가입 성공");
        navigate("/custom-login");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "회원가입 실패. 다시 시도하세요.");
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      setError("회원가입 중 오류가 발생했습니다.");
    }

    setPassword("");
    setConfirmPassword("");
  };

  return (
    <MDBContainer className="login-background">
      <MDBCard className="login-card d-flex flex-row">
        <MDBCol md="6">
          <MDBCardImage
            src={`${process.env.PUBLIC_URL}/img/loginmain.png`}
            alt="register form"
            className="login-image"
          />
        </MDBCol>
        <MDBCol md="6" className="login-card-body">
          <MDBCardBody className="d-flex flex-column align-items-center">
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
            <form onSubmit={handleRegister} className="w-100">
              <MDBInput
                wrapperClass="mb-4"
                type="email"
                size="lg"
                placeholder="이메일주소"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailAvailable(null);
                }}
                onBlur={checkEmailAvailability} // 이메일 입력 필드에서 포커스가 빠질 때 실행
                required
              />
              {emailAvailable === false && (
                <p className="text-danger">이미 사용 중인 이메일입니다.</p>
              )}
              {emailAvailable === true && (
                <p className="text-success">사용 가능한 이메일입니다.</p>
              )}

              <MDBInput
                wrapperClass="mb-4"
                type="text"
                size="lg"
                placeholder="닉네임"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameAvailable(null);
                }}
                onBlur={checkUsernameAvailability} // 닉네임 입력 필드에서 포커스가 빠질 때 실행
                required
              />
              {usernameAvailable === false && (
                <p className="text-danger">이미 사용 중인 닉네임입니다.</p>
              )}
              {usernameAvailable === true && (
                <p className="text-success">사용 가능한 닉네임입니다.</p>
              )}

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

              {error && <p className="text-danger mb-3">{error}</p>}
              <MDBBtn
                color="dark"
                type="submit"
                className="mb-4 px-5"
                size="lg"
              >
                회원가입
              </MDBBtn>
            </form>
            <p className="mt-3 mb-5">
              이미 계정이 있으신가요?{" "}
              <Link to="/custom-login" className="text-muted">
                로그인
              </Link>
            </p>
          </MDBCardBody>
        </MDBCol>
      </MDBCard>
    </MDBContainer>
  );
}

export default Register;
