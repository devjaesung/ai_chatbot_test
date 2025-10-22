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

  // static files
  if (req.method === "GET") {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    // Default to index.html for root path
    const filePath = req.url === "/" ? "/index.html" : req.url;
    const fullPath = path.join("./public", filePath);

    try {
      const content = await fs.readFile(fullPath, "utf8");
      const ext = path.extname(filePath);
      const contentType =
        {
          ".html": "text/html",
          ".css": "text/css",
          ".js": "text/javascript",
        }[ext] || "text/plain";

      res.writeHead(200, { "Content-Type": `${contentType}; charset=utf-8` });
      return res.end(content);
    } catch (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not Found");
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
