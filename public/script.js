// 간단한 채팅/모달 제어 스크립트 (기존 ID와 호환)
const $ = (sel) => document.querySelector(sel);
const chatBox = $("#chat-box");
const userInput = $("#user-input");
const sendBtn = $("#send-button");
const loginBtn = $("#login-button");
const signupBtn = $("#signup-button");

const loginModal = $("#login-modal");
const signupModal = $("#signup-modal");
const closeLogin = $("#close-login");
const closeSignup = $("#close-signup");
const loginForm = $("#login-form");
const signupForm = $("#signup-form");

function openModal(modal) {
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal(modal) {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}
function appendMsg(text, who = "bot") {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  appendMsg(text, "user");
  userInput.value = "";
  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "요청 실패");
    appendMsg(data.output ?? "(빈 응답)", "bot");
  } catch (err) {
    appendMsg(`에러: ${err.message}`, "bot");
  }
}

// 이벤트 바인딩
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

loginBtn.addEventListener("click", () => openModal(loginModal));
signupBtn.addEventListener("click", () => openModal(signupModal));
closeLogin.addEventListener("click", () => closeModal(loginModal));
closeSignup.addEventListener("click", () => closeModal(signupModal));

loginModal.addEventListener("click", (e) => {
  if (e.target === loginModal) closeModal(loginModal);
});
signupModal.addEventListener("click", (e) => {
  if (e.target === signupModal) closeModal(signupModal);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal(loginModal);
    closeModal(signupModal);
  }
});

// 폼 더미 핸들러(백엔드 연동 시 교체)
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  closeModal(loginModal);
  appendMsg("로그인 성공(더미).", "bot");
});
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  closeModal(signupModal);
  appendMsg("회원 가입 완료(더미).", "bot");
});
