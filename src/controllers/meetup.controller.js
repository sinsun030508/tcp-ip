// src/controllers/meetup.controller.js

// 지금은 DB 안 쓰고, 그냥 중심점 계산 + 더미 장소 몇 개 생성해서 보내는 버전

exports.recommend = (req, res) => {
    const { category, locations } = req.body;

    console.log("📩 /api/meetup/recommend 요청 body:", req.body);

    // locations 검증
    if (!Array.isArray(locations) || locations.length === 0) {
        return res
            .status(400)
            .json({ success: false, message: "locations 배열이 비어있습니다." });
    }

    // 중심 좌표 계산 (단순 평균)
    let sumLat = 0;
    let sumLng = 0;
    locations.forEach((loc) => {
        sumLat += Number(loc.lat);
        sumLng += Number(loc.lng);
    });

    const centerLat = sumLat / locations.length;
    const centerLng = sumLng / locations.length;

    const center = { lat: centerLat, lng: centerLng };

    // 더미 추천 장소 3개 (중심 주변으로 살짝씩 이동)
    const places = [
        {
            name: category ? `${category} 추천 1` : "추천 장소 1",
            lat: centerLat + 0.001,
            lng: centerLng + 0.001,
            distance: 0.2,
        },
        {
            name: category ? `${category} 추천 2` : "추천 장소 2",
            lat: centerLat - 0.001,
            lng: centerLng,
            distance: 0.35,
        },
        {
            name: category ? `${category} 추천 3` : "추천 장소 3",
            lat: centerLat,
            lng: centerLng - 0.001,
            distance: 0.5,
        },
    ];

    return res.json({
        success: true,
        center,
        places,
    });
};
