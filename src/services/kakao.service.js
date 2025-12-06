// src/services/kakao.service.js
const axios = require("axios");

/**
 * 카카오 내비 Directions API 호출
 * @param {number} startLat
 * @param {number} startLng
 * @param {number} endLat
 * @param {number} endLng
 */
async function getDrivingRoute(startLat, startLng, endLat, endLng) {
    try {
        console.log("🚗 getDrivingRoute 호출:", { startLat, startLng, endLat, endLng });

        const res = await axios({
            url: "https://apis-navi.kakaomobility.com/v1/directions",
            method: "GET",
            headers: {
                Authorization: `KakaoAK ${process.env.KAKAO_REST_KEY}`,
                // ⚠️ KA 헤더 필수 (os / origin 포함)
                KA: "sdk/1.0 os/WEB origin/http://localhost:3000"
            },
            params: {
                origin: `${startLng},${startLat}`,       // "lng,lat"
                destination: `${endLng},${endLat}`       // "lng,lat"
            }
        });

        console.log("✅ 길찾기 API 응답 OK");
        return res.data;
    } catch (err) {
        // 여기서 에러 내용 아주 자세히 찍어서 확인
        if (err.response) {
            console.error("🚨 길찾기 API 오류 response:", err.response.data);
        } else {
            console.error("🚨 길찾기 API 오류:", err.message);
        }
        return null;
    }
}

module.exports = { getDrivingRoute };
