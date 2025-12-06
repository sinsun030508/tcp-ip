// src/controllers/meetup.controller.js

const axios = require("axios");
const db = require("../config/db");
const { getDrivingRoute } = require("../services/kakao.service");

/* ----------------------------------------------------
 * 1) 카카오 + DB 기반 추천 장소
 * ---------------------------------------------------- */
exports.recommendPlaces = async (req, res) => {
    const { category, center, sort } = req.body;

    if (!center || !center.lat || !center.lng) {
        return res.status(400).json({ error: "center 좌표가 필요합니다." });
    }

    try {
        // ① 카카오 장소 검색 API 호출
        const kakaoRes = await axios.get(
            "https://dapi.kakao.com/v2/local/search/keyword.json",
            {
                headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_KEY}` },
                params: {
                    query: category || "카페",
                    x: center.lng,
                    y: center.lat,
                    radius: 3000,
                    sort: "accuracy",
                },
            }
        );

        const places = kakaoRes.data.documents;

        const enriched = [];

        for (const p of places) {
            const [rows] = await db.query(
                "SELECT * FROM places WHERE kakao_id = ?",
                [p.id]
            );

            let placeInfo;

            if (rows.length > 0) {
                placeInfo = rows[0];

                await db.query(
                    "UPDATE places SET search_count = search_count + 1 WHERE kakao_id = ?",
                    [p.id]
                );
            } else {
                await db.query(
                    "INSERT INTO places (kakao_id, name, lat, lng, category, address) VALUES (?, ?, ?, ?, ?, ?)",
                    [
                        p.id,
                        p.place_name,
                        p.y,
                        p.x,
                        p.category_group_name,
                        p.address_name,
                    ]
                );

                placeInfo = {
                    popularity: 0,
                    search_count: 1,
                };
            }

            const dx = center.lng - p.x;
            const dy = center.lat - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy) * 100;

            enriched.push({
                id: p.id,
                name: p.place_name,
                lat: Number(p.y),
                lng: Number(p.x),
                address: p.address_name,
                category: p.category_group_name,
                distance,
                search_count: placeInfo.search_count,
                popularity: placeInfo.popularity,
            });
        }

        let sorted = enriched;

        if (sort === "distance") {
            sorted = enriched.sort((a, b) => a.distance - b.distance);
        } else if (sort === "popular") {
            sorted = enriched.sort(
                (a, b) =>
                    b.popularity +
                    b.search_count * 0.5 -
                    (a.popularity + a.search_count * 0.5)
            );
        }

        return res.json({
            success: true,
            center,
            places: sorted.slice(0, 10),
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "추천 장소 검색 실패" });
    }
};

/* ----------------------------------------------------
 * 2) 추천 API (중심 좌표만 계산)
 * ---------------------------------------------------- */
exports.recommend = (req, res) => {
    const { locations } = req.body;

    if (!Array.isArray(locations) || locations.length === 0) {
        return res
            .status(400)
            .json({ success: false, message: "locations 배열이 비어있습니다." });
    }

    let sumLat = 0;
    let sumLng = 0;

    locations.forEach((loc) => {
        sumLat += Number(loc.lat);
        sumLng += Number(loc.lng);
    });

    const center = {
        lat: sumLat / locations.length,
        lng: sumLng / locations.length,
    };

    return res.json({
        success: true,
        center,
        places: [], // 더미 없음
    });
};

/* ----------------------------------------------------
 * 3) 인기 증가
 * ---------------------------------------------------- */
exports.increasePopularity = async (req, res) => {
    const { kakao_id } = req.body;

    await db.query(
        "UPDATE places SET popularity = popularity + 1 WHERE kakao_id = ?",
        [kakao_id]
    );

    res.json({ success: true });
};

/* ----------------------------------------------------
 * 4) 실제 도로 경로 (카카오 내비)
 * ---------------------------------------------------- */
exports.getRoute = async (req, res) => {
    const { start, end } = req.body;

    console.log("📩 /api/meetup/route 요청 body:", req.body);

    if (!start || !end) {
        return res.status(400).json({ message: "start 또는 end 좌표 필요" });
    }

    try {
        const data = await getDrivingRoute(start.lat, start.lng, end.lat, end.lng);

        if (!data) {
            return res.status(500).json({ error: "경로 조회 실패" });
        }

        // 그대로 프론트로 넘겨도 되고, 필요한 데이터만 가공해서 보내도 됨
        return res.json({
            success: true,
            route: data
        });
    } catch (e) {
        console.error("🚨 getRoute 내부 오류:", e);
        return res.status(500).json({ error: "서버 내부 오류" });
    }
};

