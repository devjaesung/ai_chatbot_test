// server.mjs
import "dotenv/config";
import http from "http";
import { GoogleGenerativeAI } from "@google/generative-ai";

const PORT = process.env.PORT || 5173;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Missing API_KEY in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    });
    return res.end();
  }

  // === (A) 스트리밍: SSE ===
  if (req.method === "GET" && req.url.startsWith("/chat/stream")) {
    try {
      // 쿼리에서 prompt 추출
      const urlObj = new URL(req.url, `http://localhost:${PORT}`);
      const prompt = urlObj.searchParams.get("prompt") || "";
      if (!prompt.trim()) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("prompt is required");
      }

      // SSE 헤더
      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        // nginx 등 중간 프록시 버퍼링 방지
        "X-Accel-Buffering": "no",
      });

      // 주기적인 heartbeat (브라우저 연결 유지)
      const heartbeat = setInterval(() => {
        res.write(`: heartbeat\n\n`);
      }, 15000);

      // 클라이언트 종료 처리
      req.on("close", () => {
        clearInterval(heartbeat);
        try {
          res.end();
        } catch {}
      });

      // Gemini 스트리밍
      const stream = await model.generateContentStream(prompt);

      for await (const chunk of stream.stream) {
        const text = chunk?.text?.() || "";
        for (const ch of text) {
          // 한 글자씩 내려보냄
          res.write(`data: ${ch}\n\n`);
        }
      }

      // 최종 완료 이벤트
      res.write(`event: done\ndata: [DONE]\n\n`);
      clearInterval(heartbeat);
      return res.end();
    } catch (err) {
      res.write(
        `event: error\ndata: ${JSON.stringify(String(err?.message || err))}\n\n`
      );
      return res.end();
    }
  }

  // === (B) 기존 /chat (비스트리밍) ===
  if (req.method === "POST" && req.url === "/chat") {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", async () => {
      try {
        const { prompt } = JSON.parse(raw || "{}");
        if (!prompt || typeof prompt !== "string") {
          return sendJson(res, 400, { error: "prompt is required (string)" });
        }

        const result = await model.generateContent(prompt);
        const text = result.response?.text?.() ?? "";
        return sendJson(res, 200, { output: text });
      } catch (err) {
        const code = err?.status || 500;
        return sendJson(res, code, { error: String(err?.message || err) });
      }
    });
    return;
  }

  // === (C) 정적 파일 서빙 (경로 버그 수정) ===
  if (req.method === "GET") {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const urlPath = req.url.split("?")[0]; // 쿼리 제거
    const filePath =
      urlPath === "/" ? "index.html" : urlPath.replace(/^\//, ""); // 리딩 슬래시 제거
    const fullPath = path.join(process.cwd(), "public", filePath);

    try {
      const content = await fs.readFile(fullPath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        {
          ".html": "text/html",
          ".css": "text/css",
          ".js": "text/javascript",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".svg": "image/svg+xml",
          ".ico": "image/x-icon",
        }[ext] || "application/octet-stream";

      res.writeHead(200, { "Content-Type": `${contentType}; charset=utf-8` });
      return res.end(content);
    } catch (error) {
      // 그냥 404
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
