// 필요한 라이브러리들을 불러옵니다.
const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config(); // .env 파일의 환경 변수를 로드합니다.

const app = express();
const port = 3000;

// JSON 요청 본문을 파싱하고, public 폴더의 정적 파일을 제공합니다.
app.use(express.json());
app.use(express.static("public"));

// 클라이언트로부터 챗봇 메시지를 받아 처리할 API 엔드포인트입니다.
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // process.env를 통해 .env 파일의 API 키를 안전하게 사용합니다.
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data); // OpenAI로부터 받은 응답을 클라이언트에 전달합니다.
  } catch (error) {
    console.error("API 호출 중 오류 발생:", error);
    res
      .status(500)
      .json({ error: "AI 응답을 생성하는 데 문제가 발생했습니다." });
  }
});

// 서버를 시작합니다.
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
