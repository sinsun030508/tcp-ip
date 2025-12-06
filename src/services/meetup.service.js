// src/services/meetup.service.js
const kakaoService = require("./kakao.service");

async function getRecommendedPlaces(locations, category) {
    const center = calcCenterPoint(locations);

    // 1) 카카오에서 중심 근처 장소 검색
    const placesFromKakao = await kakaoService.searchPlacesNear(center, category);

    // 2) 각 장소까지의 거리 계산
    const ranked = placesFromKakao
      .map(p => ({
        ...p,
        distance: calcDistance(center.lat, center.lng, p.lat, p.lng)
      }))
      .sort((a, b) => a.distance - b.distance);

    return { center, places: ranked };
}
