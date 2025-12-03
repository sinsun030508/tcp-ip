const pool = require("../config/db");

// 랜덤 방 코드 생성
function generateRoomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// 방 만들기
async function createRoom(nickname) {
    let code = generateRoomCode();

    // 충돌 방지: 이미 존재하면 새 코드 생성
    while (true) {
        const [rows] = await pool.query("SELECT code FROM rooms WHERE code = ?", [code]);
        if (rows.length === 0) break;
        code = generateRoomCode();
    }

    // rooms 테이블 저장
    await pool.query("INSERT INTO rooms (code) VALUES (?)", [code]);

    // room_users 등록
    await pool.query(
        "INSERT INTO room_users (room_code, nickname) VALUES (?, ?)",
        [code, nickname]
    );

    return { code, users: [nickname] };
}

// 방 참가
async function joinRoom(roomCode, nickname) {
    const [room] = await pool.query("SELECT * FROM rooms WHERE code = ?", [roomCode]);
    if (room.length === 0) return null; // 방 없음

    // room_users 에 삽입
    await pool.query(
        "INSERT INTO room_users (room_code, nickname) VALUES (?, ?)",
        [roomCode, nickname]
    );

    // 방 참가자 다시 조회
    const [users] = await pool.query(
        "SELECT nickname FROM room_users WHERE room_code = ?",
        [roomCode]
    );

    return { code: roomCode, users: users.map(u => u.nickname) };
}

// 방 정보 가져오기
async function getRoom(roomCode) {
    const [room] = await pool.query("SELECT * FROM rooms WHERE code = ?", [roomCode]);
    if (room.length === 0) return null;

    const [users] = await pool.query(
        "SELECT nickname FROM room_users WHERE room_code = ?",
        [roomCode]
    );

    return {
        code: roomCode,
        users: users.map(u => u.nickname),
        created_at: room[0].created_at
    };
}

module.exports = {
    createRoom,
    joinRoom,
    getRoom
};
