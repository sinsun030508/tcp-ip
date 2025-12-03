const pool = require("../config/db");

// ✅ 카테고리로 장소 목록 가져오기
async function getPlacesByCategory(category) {
    const [rows] = await pool.query(
        "SELECT * FROM place WHERE category = ?",
        [category]
    );
    return rows;
}

// ✅ 이름/카테고리로 검색
async function searchPlaces(keyword, category) {
    let sql = "SELECT * FROM place WHERE 1=1";
    const params = [];

    if (keyword) {
        sql += " AND name LIKE ?";
        params.push(`%${keyword}%`);
    }

    if (category) {
        sql += " AND category = ?";
        params.push(category);
    }

    sql += " ORDER BY popularity DESC, search_count DESC, id DESC";

    const [rows] = await pool.query(sql, params);
    return rows;
}

module.exports = {
    getPlacesByCategory,
    searchPlaces
};
