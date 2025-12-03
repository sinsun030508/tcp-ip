const Place = require("../models/place.model");

// GET /api/places/search
exports.searchPlaces = async (req, res) => {
    try {
        const { keyword = "", category = "" } = req.query;

        const places = await Place.searchPlaces(keyword, category);

        res.json(places);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "검색 중 서버 오류", error: err });
    }
};
