// src/routes/meetup.routes.js
const express = require("express");
const router = express.Router();
const MeetupController = require("../controllers/meetup.controller");

// 추천 API
router.post("/recommend", MeetupController.recommend);

module.exports = router;
