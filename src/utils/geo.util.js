// src/utils/geo.util.js

// 📌 중심점 계산 (lat/lng 평균)
function calcCenterPoint(locations) {
    if (!locations || locations.length === 0) {
        throw new Error("locations 배열이 비어있습니다.");
    }

    let sumLat = 0;
    let sumLng = 0;

    locations.forEach(loc => {
        sumLat += Number(loc.lat);
        sumLng += Number(loc.lng);
    });

    return {
        lat: sumLat / locations.length,
        lng: sumLng / locations.length
    };
}

// 📌 하버사인 거리 계산 (미터 단위)
function calcDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // 지구 반지름(m)
    const toRad = degree => (degree * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 거리 (m)
}

module.exports = {
    calcCenterPoint,
    calcDistance
};
