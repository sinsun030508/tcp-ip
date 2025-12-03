const express = require("express");
const router = express.Router();
const PlaceController = require("../controllers/place.controller");

// /api/places/search
router.get("/search", PlaceController.searchPlaces);

module.exports = router;
