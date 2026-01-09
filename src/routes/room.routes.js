const express = require("express");
const router = express.Router();
const RoomController = require("../controllers/room.controller");

router.post("/create", RoomController.createRoom);
router.post("/join", RoomController.joinRoom);
router.get("/:code", RoomController.getRoom);
router.post("/create", async (req, res) => {
  try {
    const { nickname } = req.body;

    if (!nickname || typeof nickname !== "string") {
      return res.status(400).json({ success: false, message: "nickname이 필요합니다." });
    }

    // DB insert / roomCode 생성 로직...
    return res.json({ success: true, roomCode: "ABCD12" });
  } catch (e) {
    console.error("rooms/create error:", e);
    return res.status(500).json({ success: false, message: e.message });
  }
});



module.exports = router;
