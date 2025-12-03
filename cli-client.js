// cli-client.js
const { io } = require("socket.io-client");

// ----- 간단한 인자 파싱 -----
// 사용법: node cli-client.js ROOM_CODE NICKNAME
const roomCode = process.argv[2];
const nickname = process.argv[3];

if (!roomCode || !nickname) {
    console.log("사용법: node cli-client.js [방코드] [닉네임]");
    process.exit(1);
}

// 서버 주소 (같은 PC이면 localhost)
const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("✅ 서버에 연결됨. socket.id =", socket.id);

    // 방 입장
    socket.emit("joinRoom", {
        roomCode,
        nickname,
    });

    console.log(`방 ${roomCode} 에 "${nickname}" 이름으로 참가했습니다.`);
});

// 서버에서 참가자 목록 받기
socket.on("participantsUpdate", (list) => {
    console.log("\n👥 현재 참여 인원:");
    list.forEach((p) => {
        if (p.lat != null && p.lng != null) {
            console.log(` - ${p.nickname} (${p.lat.toFixed(4)}, ${p.lng.toFixed(4)})`);
        } else {
            console.log(` - ${p.nickname} (위치 미등록)`);
        }
    });
});

// 서버에서 위치 업데이트 받기
socket.on("locationsUpdate", (locations) => {
    console.log("\n📍 위치 업데이트:");
    locations.forEach((loc) => {
        console.log(` - ${loc.nickname} → (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`);
    });
});

// 종료 처리
socket.on("disconnect", () => {
    console.log("❌ 서버와 연결이 끊어졌습니다.");
});
