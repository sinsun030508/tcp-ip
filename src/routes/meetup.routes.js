const express = require("express");
const router = express.Router();
const MeetupController = require("../controllers/meetup.controller");

// 추천 장소 (거리 + DB 반영)
router.post("/recommend", MeetupController.recommend);

// 실제 도로 경로 (카카오 네비 API)
router.post("/route", MeetupController.getRoute);

// 인기 증가 (마커 클릭 시)
router.post("/popularity", MeetupController.increasePopularity);

module.exports = router;
