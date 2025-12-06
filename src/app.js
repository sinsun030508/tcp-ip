const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const config = require("./config/config");

const app = express();

const path = require("path");
const favicon = require("serve-favicon");

const roomMembers = {};
const roomLocations = {};


app.use(favicon(path.join(__dirname, "../public/favicon.ico")));


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use("/", require("./routes/index"));
app.use("/api/meetup", require("./routes/meetup.routes"));
app.use("/api/places", require("./routes/place.routes"));
app.use("/api/rooms", require("./routes/room.routes"));
const meetupRoutes = require("./routes/meetup.routes");
app.use("/api/meetup", meetupRoutes);

// ✅ HTTP 서버 + Socket.IO 서버 생성
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// ✅ 방별 참가자 위치 저장 (메모리)
// 기존에 있던 부분 근처

// 방 참가
io.on("connection", (socket) => {
    console.log("🔌 새 클라이언트 접속:", socket.id);

    let currentRoomCode = null;
    let currentNickname = null;

    // ✅ 방 입장
    socket.on("joinRoom", ({ roomCode, nickname }) => {
        currentRoomCode = roomCode;
        currentNickname = nickname;

        socket.join(roomCode);
        console.log(`👥 ${nickname} 님이 방 ${roomCode} 입장`);

        // 방 멤버 셋 생성
        if (!roomMembers[roomCode]) {
            roomMembers[roomCode] = new Set();
        }
        roomMembers[roomCode].add(nickname);

        // 위치 저장용 객체
        if (!roomLocations[roomCode]) {
            roomLocations[roomCode] = {};
        }

        // ✅ 기존 위치 리스트 (위치 정보 있는 사람들)
        const locationsArray = Object.entries(roomLocations[roomCode]).map(
            ([nick, loc]) => ({
                nickname: nick,
                lat: loc.lat,
                lng: loc.lng,
            })
        );

        // 새 유저에게만 현재 위치 전송
        socket.emit("locationsUpdate", locationsArray);

        // 방 전체에 참가자 목록 전송
        broadcastParticipants(roomCode);
    });

    // ✅ 위치 업데이트
    socket.on("updateLocation", ({ roomCode, nickname, lat, lng }) => {
        if (!roomLocations[roomCode]) {
            roomLocations[roomCode] = {};
        }
        roomLocations[roomCode][nickname] = { lat, lng };

        const locationsArray = Object.entries(roomLocations[roomCode]).map(
            ([nick, loc]) => ({
                nickname: nick,
                lat: loc.lat,
                lng: loc.lng,
            })
        );

        // 위치는 전체에게 브로드캐스트
        io.to(roomCode).emit("locationsUpdate", locationsArray);

        // 참가자 목록도 갱신
        broadcastParticipants(roomCode);
    });

    // ✅ 클라이언트에서 로그아웃 버튼 눌렀을 때
    socket.on("leaveRoom", ({ roomCode, nickname }) => {
        console.log(`🚪 ${nickname} 님이 방 ${roomCode}에서 로그아웃`);

        if (roomMembers[roomCode]) {
            roomMembers[roomCode].delete(nickname);
        }
        if (roomLocations[roomCode]) {
            delete roomLocations[roomCode][nickname];
        }

        socket.leave(roomCode);
        broadcastParticipants(roomCode);
    });

    // ✅ 탭 닫기 / 새로고침 등으로 소켓이 끊겼을 때
    socket.on("disconnect", () => {
        console.log("❌ 클라이언트 연결 종료:", socket.id);

        if (currentRoomCode && currentNickname) {
            const roomCode = currentRoomCode;
            const nickname = currentNickname;

            if (roomMembers[roomCode]) {
                roomMembers[roomCode].delete(nickname);
            }
            if (roomLocations[roomCode]) {
                delete roomLocations[roomCode][nickname];
            }

            broadcastParticipants(roomCode);
        }
    });
});


// ✅ 참가자 목록 브로드캐스트 함수
function broadcastParticipants(roomCode) {
    const membersSet = roomMembers[roomCode] || new Set();
    const locations = roomLocations[roomCode] || {};

    const list = Array.from(membersSet).map((nickname) => {
        const loc = locations[nickname];
        return {
            nickname,
            lat: loc ? loc.lat : null,
            lng: loc ? loc.lng : null,
        };
    });

    io.to(roomCode).emit("participantsUpdate", list);
}


app.use("/api/meetup", require("./routes/meetup.routes"));


// ✅ server.listen 으로 변경
server.listen(config.port, () => {
    console.log(`🚀 Server + Socket.IO running on http://localhost:${config.port}`);
});

module.exports = { app, io };
