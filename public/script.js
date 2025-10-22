// DOM 요소 선택
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const chatBox = document.getElementById("chat-box");
const loginButton = document.getElementById("login-button");
const signupButton = document.getElementById("signup-button");

// 모달 관련 요소 선택
const loginModal = document.getElementById("login-modal");
const signupModal = document.getElementById("signup-modal");
const closeLogin = document.getElementById("close-login");
const closeSignup = document.getElementById("close-signup");

// 이벤트 리스너 추가
sendButton.addEventListener("click", () => {
  const userMessage = userInput.value;

  // 사용자 메시지를 채팅 박스에 추가
  if (userMessage) {
    addMessage("User: " + userMessage);
    userInput.value = ""; // 입력 필드 초기화
    respondToUser(userMessage); // AI 응답 생성
  }
});

// 로그인 버튼 클릭 이벤트
loginButton.addEventListener("click", () => {
  loginModal.style.display = "block"; // 모달 표시
});

// 회원 가입 버튼 클릭 이벤트
signupButton.addEventListener("click", () => {
  signupModal.style.display = "block"; // 모달 표시
});

// 모달 닫기 이벤트
closeLogin.addEventListener("click", () => {
  loginModal.style.display = "none";
});

closeSignup.addEventListener("click", () => {
  signupModal.style.display = "none";
});

// 로그인 및 회원 가입 폼 제출 이벤트
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault(); // 기본 제출 동작 방지
  alert("로그인 성공!"); // 로그인 성공 메시지
  loginModal.style.display = "none"; // 모달 닫기
});

document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault(); // 기본 제출 동작 방지
  alert("회원 가입 성공!"); // 회원 가입 성공 메시지
  signupModal.style.display = "none"; // 모달 닫기
});

// 간편 가입 버튼 클릭 이벤트
document.getElementById("quick-signup-button").addEventListener("click", () => {
  document.getElementById("signup-username").value = "간편가입사용자";
  document.getElementById("signup-userid").value = "quickuser123";
  document.getElementById("signup-phone").value = "010-1234-5678";
  document.getElementById("signup-password").value = "password123";
});

// 간편 가입 옵션 클릭 이벤트
document.getElementById("signup-naver").addEventListener("click", () => {
  alert("네이버 아이디로 간편 가입이 진행됩니다.");
  // 실제 네이버 API 연동 코드 작성 필요
});

document.getElementById("signup-kakao").addEventListener("click", () => {
  alert("카카오톡 아이디로 간편 가입이 진행됩니다.");
  // 실제 카카오 API 연동 코드 작성 필요
});

document.getElementById("signup-google").addEventListener("click", () => {
  alert("구글 아이디로 간편 가입이 진행됩니다.");
  // 실제 구글 API 연동 코드 작성 필요
});

// 메시지를 채팅 박스에 추가하는 함수
function addMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  chatBox.appendChild(messageElement);
}

// 사용자 메시지에 대한 AI 응답 생성
// function respondToUser(message) {
//     let response = '';

//     // 간단한 응답 로직 (여기에 AI 로직 추가 가능)
//     if (message.includes('안녕하세요')) {
//         response = '안녕하세요! 어떻게 도와드릴까요?';
//     } else if (message.includes('친구')) {
//         response = '친구가 되어 드릴게요!';
//     } else {
//         response = '죄송하지만, 그에 대한 답변을 준비하지 못했습니다.';
//     }

//     // AI 응답을 채팅 박스에 추가
//     addMessage('AI: ' + response);
// }

// 사용자 메시지에 대한 AI 응답 생성
async function respondToUser(message) {
  // API URL을 우리 백엔드 서버의 엔드포인트로 변경합니다.
  const apiURL = "/api/chat";

  // "생각 중..." 메시지를 먼저 표시합니다.
  const thinkingMessage = document.createElement("div");
  thinkingMessage.textContent = "AI: 생각 중...";
  chatBox.appendChild(thinkingMessage);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // 서버로 사용자 메시지를 보냅니다.
      body: JSON.stringify({ message: message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // "생각 중..." 메시지를 실제 AI 응답으로 교체합니다.
    thinkingMessage.textContent = "AI: " + aiResponse;
  } catch (error) {
    console.error("API 호출 중 오류 발생:", error);
    // 오류 발생 시 메시지를 수정합니다.
    thinkingMessage.textContent =
      "AI: 죄송합니다. 응답을 생성하는 데 문제가 발생했습니다.";
  }
}

// 모달 외부 클릭 시 모달 닫기
window.onclick = function (event) {
  if (event.target == loginModal) {
    loginModal.style.display = "none";
  }
  if (event.target == signupModal) {
    signupModal.style.display = "none";
  }
};
