const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const favicon = require("serve-favicon");

const config = require("./config/config");

const app = express();

// ✅ 미들웨어/정적/라우팅은 listen 전에 설정
app.use(favicon(path.join(__dirname, "../public/favicon.ico")));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// (Cloud Run 헬스체크/기본 응답)
app.get("/healthz", (req, res) => res.status(200).json({ ok: true }));
app.get("/", (req, res) => res.status(200).send("OK"));

app.use("/", require("./routes/index"));
app.use("/api/meetup", require("./routes/meetup.routes"));
app.use("/api/places", require("./routes/place.routes"));
app.use("/api/rooms", require("./routes/room.routes"));

// ✅ HTTP 서버 + Socket.IO 서버
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// ✅ 메모리 저장소
const roomMembers = {};
const roomLocations = {};

// ✅ Socket.IO 로직 (원본 그대로)
io.on("connection", (socket) => {
  console.log("🔌 새 클라이언트 접속:", socket.id);

  let currentRoomCode = null;
  let currentNickname = null;

  socket.on("joinRoom", ({ roomCode, nickname }) => {
    currentRoomCode = roomCode;
    currentNickname = nickname;

    socket.join(roomCode);
    console.log(`👥 ${nickname} 님이 방 ${roomCode} 입장`);

    if (!roomMembers[roomCode]) roomMembers[roomCode] = new Set();
    roomMembers[roomCode].add(nickname);

    if (!roomLocations[roomCode]) roomLocations[roomCode] = {};

    const locationsArray = Object.entries(roomLocations[roomCode]).map(
      ([nick, loc]) => ({ nickname: nick, lat: loc.lat, lng: loc.lng })
    );

    socket.emit("locationsUpdate", locationsArray);
    broadcastParticipants(roomCode);
  });

  socket.on("updateLocation", ({ roomCode, nickname, lat, lng }) => {
    if (!roomLocations[roomCode]) roomLocations[roomCode] = {};
    roomLocations[roomCode][nickname] = { lat, lng };

    const locationsArray = Object.entries(roomLocations[roomCode]).map(
      ([nick, loc]) => ({ nickname: nick, lat: loc.lat, lng: loc.lng })
    );

    io.to(roomCode).emit("locationsUpdate", locationsArray);
    broadcastParticipants(roomCode);
  });

  socket.on("leaveRoom", ({ roomCode, nickname }) => {
    console.log(`🚪 ${nickname} 님이 방 ${roomCode}에서 로그아웃`);

    if (roomMembers[roomCode]) roomMembers[roomCode].delete(nickname);
    if (roomLocations[roomCode]) delete roomLocations[roomCode][nickname];

    socket.leave(roomCode);
    broadcastParticipants(roomCode);
  });

  socket.on("disconnect", () => {
    console.log("❌ 클라이언트 연결 종료:", socket.id);

    if (currentRoomCode && currentNickname) {
      const roomCode = currentRoomCode;
      const nickname = currentNickname;

      if (roomMembers[roomCode]) roomMembers[roomCode].delete(nickname);
      if (roomLocations[roomCode]) delete roomLocations[roomCode][nickname];

      broadcastParticipants(roomCode);
    }
  });
});

function broadcastParticipants(roomCode) {
  const membersSet = roomMembers[roomCode] || new Set();
  const locations = roomLocations[roomCode] || {};

  const list = Array.from(membersSet).map((nickname) => {
    const loc = locations[nickname];
    return { nickname, lat: loc ? loc.lat : null, lng: loc ? loc.lng : null };
  });

  io.to(roomCode).emit("participantsUpdate", list);
}

// ✅ Cloud Run 최우선: 환경변수 PORT 사용
const PORT = Number(process.env.PORT) || 8080;

// 로컬에서 config.port를 쓰고 싶다면 "fallback"으로만 사용 가능
// const PORT = Number(process.env.PORT) || config.port || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server + Socket.IO listening on ${PORT}`);
});

module.exports = { app, io };
