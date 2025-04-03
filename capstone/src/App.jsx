import { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/hello") // Spring Boot API 호출
      .then((response) => response.text()) // 문자열 반환이므로 .text() 사용
      .then((data) => setMessage(data)) // 상태 업데이트
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h1>React & Spring Boot 연결 테스트</h1>
      <p>Spring Boot 응답: {message}</p>
    </div>
  );
}

export default App;
