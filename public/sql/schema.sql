-- ===============================
-- 1) place 테이블 (추천 장소 DB)
-- ===============================

DROP TABLE IF EXISTS place;

CREATE TABLE place (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,    -- cafe, food, study 등
    lat DOUBLE NOT NULL,
    lng DOUBLE NOT NULL,
    
    rating FLOAT DEFAULT 0,           -- 평점
    popularity INT DEFAULT 0,         -- 방문자/검색량 같은 가중치
    search_count INT DEFAULT 0,       -- 카테고리 검색량 또는 클릭 수
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ===============================
-- 2) user_location 테이블 (선택)
-- - 여러 명이 지도에서 클릭해서 위치 등록할 때 사용
-- ===============================

DROP TABLE IF EXISTS user_location;

CREATE TABLE user_location (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,   -- 유저 구분용 (로그인 없을 때 대체)
    lat DOUBLE NOT NULL,
    lng DOUBLE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(5) NOT NULL UNIQUE,      -- 방 코드 (ABCDE)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(5) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE
);


-- ===============================
-- 3) 샘플 데이터 (place)
-- - 카페/식당/스터디룸 등 예시 10개
-- ===============================

INSERT INTO place (name, category, lat, lng, rating, popularity, search_count)
VALUES
('스타벅스 시청점', 'cafe', 37.5663, 126.9779, 4.5, 500, 300),
('메가커피 광화문점', 'cafe', 37.5711, 126.9769, 4.3, 350, 250),
('투썸플레이스 종로점', 'cafe', 37.5695, 126.9865, 4.4, 420, 290),

('김밥천국 시청점', 'food', 37.5675, 126.9780, 4.1, 300, 210),
('한솥도시락 광화문점', 'food', 37.5719, 126.9762, 4.2, 280, 200),
('이디야커피 세종문화회관점', 'cafe', 37.5728, 126.9767, 4.0, 260, 180),

('스터디카페 광화문점', 'study', 37.5708, 126.9830, 4.6, 410, 220),
('작심스터디 종로본점', 'study', 37.5692, 126.9860, 4.7, 430, 240),
('연세스터디룸 종각점', 'study', 37.5700, 126.9820, 4.5, 380, 200),

('브런치카페 리치', 'cafe', 37.5650, 126.9825, 4.8, 450, 320);
