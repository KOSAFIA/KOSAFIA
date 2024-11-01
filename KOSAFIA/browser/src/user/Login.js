import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // 세션 쿠키 포함
      });

      if (response.ok) {
        navigate("/LoginOk"); // 로그인 성공 시 LoginOk 페이지로 리디렉션
      } else {
        const errorData = await response.text();
        setError(errorData || "로그인 실패. 다시 시도하세요.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      setError("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <MDBContainer className="login-background">
      <MDBCard className="login-card d-flex flex-row">
        <MDBCol md="6">
          <MDBCardImage
            src={`${process.env.PUBLIC_URL}/img/초딩마피아.jpg`}
            alt="login form"
            className="login-image"
          />
        </MDBCol>
        <MDBCol md="6" className="login-card-body">
          <MDBCardBody className="d-flex flex-column align-items-center">
            <div className="d-flex flex-row mt-2">
              <MDBIcon fas icon="cubes fa-3x me-3" style={{ color: "#ff6219" }} />
              <span className="h1 fw-bold">Login</span>
            </div>

            <h5 className="fw-normal my-4 pb-3" style={{ letterSpacing: "1px" }}>
              Sign into your account
            </h5>

            <form onSubmit={handleLogin} className="w-100">
              <MDBInput
                wrapperClass="mb-4"
                type="email"
                size="lg"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

              {error && <p className="text-danger mb-3">{error}</p>}
              <MDBBtn color="dark" type="submit" className="mb-4 px-5" size="lg">
                Login
              </MDBBtn>
            </form>

            <p className="mt-3 mb-5">
              계정이 없으신가요?{" "}
              <a href="/register" className="text-muted">
                회원가입
              </a>
            </p>
          </MDBCardBody>
        </MDBCol>
      </MDBCard>
    </MDBContainer>
  );
}

export default Login;
