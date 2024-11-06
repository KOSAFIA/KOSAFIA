import axios from "axios";

const CheckCors = async () => {
  try {
    const response = await axios.get("http://localhost:8080/api/user/profile", {
      withCredentials: true, // 쿠키 인증 허용 (세션이 필요한 경우)
    });
    console.log("CORS 적용 성공:", response.data);
  } catch (error) {
    console.error("CORS 오류:", error);
  }
};

export default CheckCors;
