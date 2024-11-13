import axios from "axios"; // HTTP 요청을 보내기 위해 axios 라이브러리를 가져옵니다.

// CORS (Cross-Origin Resource Sharing) 검사를 수행하는 함수
//CORS는 웹 애플리케이션이 다른 출처의 리소스에 접근할 때 보안 정책으로 인해 발생할 수 있는 오류입니다.
//이 함수는 클라이언트와 서버 간의 CORS 설정이 올바르게 되어 있는지 확인하기 위해 만들어졌습니다.
const CheckCors = async () => {
  try {
    // 백엔드 서버에 GET 요청을 보냅니다. 이 요청은 세션이 필요한 경우 쿠키를 포함하여 전송합니다.
    //  const response = await axios.get("http://localhost:8080/api/user/profile", {
    const response = await axios.get(
      "https://ba09-115-90-99-121.ngrok-free.app/api/user/profile",
      {
        withCredentials: true, // 쿠키 인증을 허용하여 요청 (세션 정보 포함)
      }
    );
    console.log("CORS 적용 성공:", response.data); // 요청 성공 시 서버에서 받은 데이터를 콘솔에 출력
  } catch (error) {
    // 요청이 실패할 경우, CORS 문제나 기타 오류 메시지를 콘솔에 출력
    console.error("CORS 오류:", error);
  }
};

export default CheckCors; // 다른 파일에서 이 함수를 사용할 수 있도록 내보냅니다.
