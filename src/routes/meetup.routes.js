// src/routes/meetup.routes.js
const express = require("express");
const router = express.Router();
const meetupController = require("../controllers/meetup.controller");

// 추천 장소 (카카오 API + DB 결합)
router.post("/recommend", meetupController.recommendPlaces);

// 인기 증가 (마커 클릭 시)
router.post("/popularity", meetupController.increasePopularity);

module.exports = router;
