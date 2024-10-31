import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 리디렉션을 위해 useNavigate 훅 사용
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
} from "mdb-react-ui-kit";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // 리디렉션을 위한 navigate 설정

  // 회원가입 요청 핸들러
  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    const userData = { email, username, password };

    try {
      const response = await fetch("http://localhost:8080/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        console.log("회원가입 성공");
        navigate("/custom-login"); // 회원가입 후 로그인 페이지로 리디렉션
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
            src={`${process.env.PUBLIC_URL}/img/초딩마피아.jpg`}
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
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
              <a href="/custom-login" className="text-muted">
                로그인
              </a>
            </p>

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
