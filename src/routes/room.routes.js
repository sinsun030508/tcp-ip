const express = require("express");
const router = express.Router();
const RoomController = require("../controllers/room.controller");

router.post("/create", RoomController.createRoom);
router.post("/join", RoomController.joinRoom);
router.get("/:code", RoomController.getRoom);

module.exports = router;
