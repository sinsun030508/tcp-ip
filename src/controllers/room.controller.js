const RoomService = require("../services/room.service");

exports.createRoom = async (req, res) => {
    const { nickname } = req.body;

    if (!nickname) {
        return res.status(400).json({ success: false, message: "닉네임을 입력하세요." });
    }

    try {
        const room = await RoomService.createRoom(nickname);
        res.json({ success: true, room });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "방 생성 실패", error: err });
    }
};

exports.joinRoom = async (req, res) => {
    const { nickname, roomCode } = req.body;

    if (!nickname || !roomCode) {
        return res.status(400).json({ success: false, message: "닉네임과 방 코드를 입력하세요." });
    }

    try {
        const room = await RoomService.joinRoom(roomCode, nickname);

        if (!room) {
            return res.status(404).json({ success: false, message: "존재하지 않는 방입니다." });
        }

        res.json({ success: true, room });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "방 참가 실패", error: err });
    }
};

exports.getRoom = async (req, res) => {
    const { code } = req.params;

    try {
        const room = await RoomService.getRoom(code);

        if (!room) {
            return res.status(404).json({ success: false, message: "해당 방 없음" });
        }

        res.json({ success: true, room });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "조회 실패", error: err });
    }
};
