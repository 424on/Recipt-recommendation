import React, { useState } from "react";
import axios from "axios";

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
console.log(apiKey);

function App() {
  const [input, setInput] = useState(""); // 사용자 입력
  const [chatLog, setChatLog] = useState([]); // 채팅 로그

  // API 호출 함수
  const callChatGPT = async (question, retries = 2, delay = 2000) => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: question }],
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.response && error.response.status === 429 && retries > 0) {
        console.warn(
          `Too many requests. Retrying in ${delay / 1000} seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay)); // 대기
        return callChatGPT(question, retries - 1, delay * 2); // 재귀 호출로 지수 백오프
      } else {
        console.error("API 요청 오류:", error);
        return "Error: Unable to get a response due to rate limit.";
      }
    }
  };

  // 메시지 전송 핸들러
  const handleSendMessage = async () => {
    if (!input.trim()) return; // 빈 입력 방지
    const userMessage = { role: "user", content: input };

    // 사용자 메시지를 채팅 로그에 추가
    setChatLog([...chatLog, userMessage]);
    setInput(""); // 입력 필드 초기화

    // ChatGPT API 호출 후 응답 받기
    const botResponse = await callChatGPT(input);
    const botMessage = { role: "assistant", content: botResponse };

    // 봇 응답을 채팅 로그에 추가
    setChatLog([...chatLog, userMessage, botMessage]);
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "1em",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Chatbot</h1>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "1em",
          borderRadius: "5px",
          height: "400px",
          overflowY: "scroll",
        }}
      >
        {chatLog.map((message, index) => (
          <div
            key={index}
            style={{
              margin: "0.5em 0",
              textAlign: message.role === "user" ? "right" : "left",
            }}
          >
            <strong>{message.role === "user" ? "You" : "Bot"}: </strong>
            {message.content}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", marginTop: "1em" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          style={{
            flex: "1",
            padding: "0.5em",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: "0.5em 1em",
            marginLeft: "0.5em",
            borderRadius: "5px",
            background: "#007bff",
            color: "#fff",
            border: "none",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
