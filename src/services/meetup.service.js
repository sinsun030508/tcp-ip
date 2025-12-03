const { calcCenterPoint, calcDistance } = require("../utils/geo.util");
const Place = require("../models/place.model");

async function getRecommendedPlaces(locations, category) {

    // 중심 좌표 계산
    const center = calcCenterPoint(locations);

    // DB에서 카테고리별 장소 가져오기
    const places = await Place.getPlacesByCategory(category);

    // 거리 계산 + 정렬
    const ranked = places.map(p => {
        const distance = calcDistance(center.lat, center.lng, p.lat, p.lng);
        return { ...p, distance };
    }).sort((a, b) => a.distance - b.distance);

    return { center, places: ranked };
}

module.exports = { getRecommendedPlaces };
