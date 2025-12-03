// src/controllers/meetup.controller.js

// 지금은 DB 안 쓰고, 그냥 중심점 계산 + 더미 장소 몇 개 생성해서 보내는 버전
const axios = require("axios");
const db = require("../config/db");

exports.recommendPlaces = async (req, res) => {
    const { category, center, sort } = req.body;

    if (!center || !center.lat || !center.lng) {
        return res.status(400).json({ error: "center 좌표가 필요합니다." });
    }

    try {
        // ① 카카오 장소 검색 API 호출
        const kakaoRes = await axios.get("https://dapi.kakao.com/v2/local/search/keyword.json", {
            headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_KEY}` },
            params: {
                query: category || "카페",
                x: center.lng,
                y: center.lat,
                radius: 3000,
                sort: "accuracy"
            }
        });

        const places = kakaoRes.data.documents;

        // ② DB와 결합
        const enriched = [];

        for (const p of places) {
            // DB 조회 또는 삽입
            const [rows] = await db.query(
                "SELECT * FROM places WHERE kakao_id = ?",
                [p.id]
            );

            let placeInfo;

            if (rows.length > 0) {
                placeInfo = rows[0];

                // 검색될 때마다 search_count++
                await db.query(
                    "UPDATE places SET search_count = search_count + 1 WHERE kakao_id = ?",
                    [p.id]
                );
            } else {
                // DB에 신규 삽입
                await db.query(
                    "INSERT INTO places (kakao_id, name, lat, lng, category, address) VALUES (?, ?, ?, ?, ?, ?)",
                    [
                        p.id,
                        p.place_name,
                        p.y,
                        p.x,
                        p.category_group_name,
                        p.address_name
                    ]
                );

                placeInfo = {
                    popularity: 0,
                    search_count: 1
                };
            }

            // 거리 계산
            const dx = center.lng - p.x;
            const dy = center.lat - p.y;
            const distance = Math.sqrt(dx*dx + dy*dy) * 100;
            
            enriched.push({
                id: p.id,
                name: p.place_name,
                lat: Number(p.y),
                lng: Number(p.x),
                address: p.address_name,
                category: p.category_group_name,
                distance,
                search_count: placeInfo.search_count,
                popularity: placeInfo.popularity
            });
        }

        // ③ 정렬 옵션 적용
        let sorted = enriched;

        if (sort === "distance") {
            sorted = enriched.sort((a, b) => a.distance - b.distance);
        } 
        
        else if (sort === "popular") {
            sorted = enriched.sort((a, b) =>
                (b.popularity + b.search_count * 0.5) -
                (a.popularity + a.search_count * 0.5)
            );
        }

        return res.json({
            center,
            places: sorted.slice(0, 10)   // 상위 10개만 반환
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "추천 장소 검색 실패" });
    }
};

exports.increasePopularity = async (req, res) => {
    const { kakao_id } = req.body;

    await db.query(
        "UPDATE places SET popularity = popularity + 1 WHERE kakao_id = ?",
        [kakao_id]
    );

    res.json({ success: true });
};


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
    

    return res.json({
        success: true,
        center,
        places,
    });
};
