// participants.js

// 전역으로 만들어 둔 socket 가져오기
//const socket = window.socket;

if (!socket) {
  console.error("socket 이 아직 초기화되지 않았습니다. main.js에서 window.socket = io(); 가 먼저 실행되어야 합니다.");
} else {

  const urlParams = new URLSearchParams(window.location.search);
  const roomCode = urlParams.get("room") || localStorage.getItem("roomCode");
  const nickname = urlParams.get("nickname") || localStorage.getItem("nickname");

  if (roomCode && nickname) {
    console.log("joinRoom 보내는 중:", roomCode, nickname);
    socket.emit("joinRoom", { roomCode, nickname });
  } else {
    console.warn("roomCode 또는 nickname이 없습니다. 참여 인원 기능이 동작하지 않습니다.");
  }

  const participantsList  = document.getElementById("participants-list");
  const participantsEmpty = document.getElementById("participants-empty");

  socket.on("participantsUpdate", (list) => {
    console.log("participantsUpdate 수신:", list);

    if (!participantsList || !participantsEmpty) return;

    participantsList.innerHTML = "";

    if (!list || list.length === 0) {
      participantsEmpty.style.display = "block";
      return;
    }

    participantsEmpty.style.display = "none";

    list.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = p.nickname;
      participantsList.appendChild(li);
    });
  });
}
