console.log("✅ main.js 로드 완료");
// 추가할거 지금은 도보상 시간만 나오고 있는데 로그인 창에서 교통수단을 선택하게 예를 들어서 자동차, 대중교통, 도보 등
// 그에 맞게 경로를 계산해서 보여주도록 기능 추가 가능
// 그리고 지금 직선상의 경로만 나오는데 카카오 지도 API의 경로탐색 기능을 이용해서 실제 도로를 따라가는 경로로도 보여줄 수 있음
// 여러 사람 위치 리스트
let socket = null;              // ✅ 전역
let participantMarkers = [];
let participantOverlays = [];   // ✅ 닉네임 오버레이용

const userLocations = [];
let map;
let centerMarker;
let placeMarkers = [];
let pendingMoveTarget = null;
let searchMarkers = [];     // 🔹 Kakao 검색 결과 마커들
let placesService = null;  // 🔹 Kakao 장소 검색 서비스


let currentRoomCode = null;
let currentNickname = null;

let routeLines = [];      // 경로(폴리라인)들 저장
let routeOverlays = [];   // 경로 위 라벨들


let hasAddedMyLocation = false;
let myMarker = null;

let participants = [];          // 방 참가자 목록

// ✅ 카카오 SDK까지 모두 로드된 뒤에 실행되도록 설정
window.addEventListener("load", () => {
    console.log("✅ window load 이벤트 발생");
    console.log("window.kakao =", window.kakao);

    if (typeof kakao === "undefined") {
        console.error("❌ kakao 객체가 없습니다. Kakao Map SDK 로딩 실패!");
        alert("Kakao Map SDK가 로드되지 않았습니다. index.html의 스크립트 태그와 appkey, 도메인 설정을 확인하세요.");
        return;
    }

    kakao.maps.load(() => {
        console.log("✅ kakao.maps.load 콜백 실행");
        initMap();
        initEvents();
        restoreSession();
    });
});

// 지도 초기화
function initMap() {
    const container = document.getElementById('map');
    const options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 5
    };

    map = new kakao.maps.Map(container, options);
        console.log("✅ 지도 초기화 완료");

    // 🔹 Kakao 장소 검색 서비스 생성
    placesService = new kakao.maps.services.Places(map);

    // ✅ 지도 우클릭 시 ...
    kakao.maps.event.addListener(map, 'rightclick', function (mouseEvent) {
        const latlng = mouseEvent.latLng;

        // 먼저 내 위치가 등록되어 있어야 함
        if (!hasAddedMyLocation || !myMarker) {
            alert("먼저 '내 위치 추가' 버튼으로 내 위치를 등록하세요.");
            return;
        }

        const lat = latlng.getLat();
        const lng = latlng.getLng();
        showMoveToast(lat, lng);
    });
}

// 버튼 이벤트 설정
function initEvents() {
    const addBtn = document.getElementById('addMeBtn');
    const recBtn = document.getElementById('recommendBtn');
    const searchBtn = document.getElementById('searchBtn');

    const loginPageBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const toastOk = document.getElementById("moveToastOk");
    const toastCancel = document.getElementById("moveToastCancel");

    // 내 위치 추가
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            addMyLocation();
        });
    }

    // 추천 장소 보기
   /* if (recBtn) {
        recBtn.addEventListener('click', () => {
            requestRecommend();
        });
    }*/

    // 검색
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchPlaces();
        });
    }

    // 로그인 페이지 이동
    if (loginPageBtn) {
        loginPageBtn.addEventListener("click", () => {
            location.href = "/login.html";
        });
    }

    // 로그아웃
    // 로그아웃
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        if (!confirm("정말 로그아웃 하시겠습니까?")) return;

        // 🔥 서버에 방 나가기 알리기
        if (socket && currentRoomCode && currentNickname) {
            socket.emit("leaveRoom", {
                roomCode: currentRoomCode,
                nickname: currentNickname,
            });
        }

        // 🔥 로컬 상태 리셋
        localStorage.removeItem("meetupNickname");
        localStorage.removeItem("meetupRoomCode");

        currentRoomCode = null;
        currentNickname = null;
        participants = [];

        // 내 위치 관련 모두 초기화
        hasAddedMyLocation = false;
        userLocations.length = 0;
        if (myMarker) {
            myMarker.setMap(null);
            myMarker = null;
        }

        // 다른 사람 마커, 경로도 제거
        participantMarkers.forEach(m => m.setMap(null));
        participantMarkers = [];
        clearRoutes();

        if (socket) {
            socket.disconnect();
            socket = null;
        }

        renderParticipants();
        updateRoomInfoUI();
    });
}

    // 우클릭 이동 토스트 버튼
    if (toastOk) {
    toastOk.addEventListener("click", () => {
        if (pendingMoveTarget) {
            moveMyLocationTo(pendingMoveTarget.lat, pendingMoveTarget.lng);
        }
        hideMoveToast();
    });
}


    if (toastCancel) {
        toastCancel.addEventListener("click", () => {
            hideMoveToast();
        });
    }
}



   

// 🔹 기존 경로(polylines) 지우기
function clearRoutes() {
    routeLines.forEach(line => line.setMap(null));
    routeLines = [];

    routeOverlays.forEach(ov => ov.setMap(null));
    routeOverlays = [];
}

/**
 * 🔹 특정 목적지까지 참가자들의 경로를 직선으로 표시
 * @param {number} destLat
 * @param {number} destLng
 * @param {string} destName
 */
function setRouteTo(destLat, destLng, destName) {
    clearRoutes();

    const destLatLng = new kakao.maps.LatLng(destLat, destLng);
    const routeInfoBox = document.getElementById("routeContent");

    const validParticipants = (participants || []).filter(p => p.lat != null && p.lng != null);

    if (!validParticipants.length) {
        if (routeInfoBox) {
            routeInfoBox.innerHTML = `<p style="font-size:0.85rem; color:#666;">
                위치가 등록된 참여자가 없습니다.
            </p>`;
        }
        return;
    }

    let infoHtml = `<p><b>${destName}</b> 까지의 경로</p><ul style="margin:4px 0; padding-left:16px;">`;

    validParticipants.forEach(p => {
    const startLatLng = new kakao.maps.LatLng(p.lat, p.lng);

    // 🔴 직선 경로
    const line = new kakao.maps.Polyline({
        map: map,
        path: [startLatLng, destLatLng],
        strokeWeight: 3,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeStyle: "solid"
    });

    routeLines.push(line);

    // 🔢 거리 계산
    const distanceMeters = line.getLength();
    const distanceKm = distanceMeters / 1000;

    const walkingSpeedMPerMin = (4 * 1000) / 60;
    const minutes = distanceMeters / walkingSpeedMPerMin;

    // 📌 직선 중간 지점에 거리 라벨 표시
    const midLat = (p.lat + destLat) / 2;
    const midLng = (p.lng + destLng) / 2;
    const midLatLng = new kakao.maps.LatLng(midLat, midLng);

    const labelContent = `
        <div style="
            padding:2px 4px;
            font-size:11px;
            color:#fff;
            background:rgba(0,0,0,0.6);
            border-radius:3px;
            white-space:nowrap;
        ">
            ${p.nickname}: ${distanceKm.toFixed(2)}km
        </div>
    `;

    const overlay = new kakao.maps.CustomOverlay({
        position: midLatLng,
        content: labelContent,
        yAnchor: 0.5
    });
    overlay.setMap(map);
    routeOverlays.push(overlay);

    // 왼쪽 요약 텍스트
    infoHtml += `<li>${p.nickname} → 약 ${distanceKm.toFixed(2)} km / 도보 약 ${minutes.toFixed(1)}분</li>`;
});


    infoHtml += `</ul>`;

    if (routeInfoBox) {
        routeInfoBox.innerHTML = infoHtml;
    }

    // 목적지를 화면 중앙으로
    map.setCenter(destLatLng);
}


function showMoveToast(lat, lng) {
    pendingMoveTarget = { lat, lng };

    const toast = document.getElementById("moveToast");
    const text = document.getElementById("moveToastText");

    if (text) {
        text.textContent = `이 위치( ${lat.toFixed(5)}, ${lng.toFixed(5)} )로 내 위치를 옮길까요?`;
    }
    if (toast) {
        toast.style.display = "flex";
    }
}

function hideMoveToast() {
    const toast = document.getElementById("moveToast");
    if (toast) {
        toast.style.display = "none";
    }
    pendingMoveTarget = null;
}






// 1) 내 위치 추가 (처음 한 번만)
function addMyLocation() {
    if (hasAddedMyLocation) {
        alert("이미 내 위치를 등록했습니다. 위치를 다시 옮기려면 지도에서 우클릭을 사용하세요.");
        return;
    }

    if (!navigator.geolocation) {
        alert("브라우저에서 위치 정보를 지원하지 않습니다.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            console.log("현재 위치:", lat, lng);

            const latlng = new kakao.maps.LatLng(lat, lng);

            // 지도 중심 이동
            map.setCenter(latlng);

            // 기존 내 마커가 있으면 제거
            if (myMarker) {
                myMarker.setMap(null);
            }

            // 내 위치 마커 생성
            myMarker = new kakao.maps.Marker({
                position: latlng,
                map: map
            });

            // 추천 요청용 배열에 내 위치 추가
            userLocations.push({ lat, lng, marker: myMarker });

            // 이제부터는 '추가' 대신 '옮기기'만 가능하게 플래그 설정
            hasAddedMyLocation = true;

            // 🔥 방에 참여 중이면 내 위치를 서버로 전송 → 다른 사람들 지도에도 뜸
            if (socket && currentRoomCode && currentNickname) {
                socket.emit("updateLocation", {
                    roomCode: currentRoomCode,
                    nickname: currentNickname,
                    lat,
                    lng
                });
            }
        },
        (err) => {
            console.error("geolocation error (addMyLocation)", err);
            alert("위치 정보를 가져오지 못했습니다.");
        }
    );
}

// ✅ 우클릭으로 선택한 좌표로 내 위치를 옮기는 함수
function moveMyLocationTo(lat, lng) {
    if (!hasAddedMyLocation || !myMarker) {
        alert("먼저 '내 위치 추가' 버튼으로 위치를 등록해 주세요.");
        return;
    }

    const latlng = new kakao.maps.LatLng(lat, lng);

    // 내 마커 위치 변경
    myMarker.setPosition(latlng);
    map.setCenter(latlng);

    // 추천용 userLocations 배열에서도 내 좌표 갱신
    userLocations.forEach(loc => {
        if (loc.marker === myMarker) {
            loc.lat = lat;
            loc.lng = lng;
        }
    });

    // 방에 속해 있다면 서버로도 위치 전송 (실시간 공유)
    if (socket && currentRoomCode && currentNickname) {
        socket.emit("updateLocation", {
            roomCode: currentRoomCode,
            nickname: currentNickname,
            lat,
            lng
        });
    }
}

// 2) 추천 요청
async function requestRecommend() {
    console.log("requestRecommend() 호출");

    if (userLocations.length === 0) {
        alert("먼저 '내 위치 추가'를 눌러 위치를 하나 이상 등록하세요.");
        return;
    }

    const categoryEl = document.getElementById('searchCategory');
    const category = categoryEl ? categoryEl.value : "";

    const locationsPayload = userLocations.map(loc => ({
        lat: loc.lat,
        lng: loc.lng
    }));

    try {
        const res = await fetch('/api/meetup/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category,
                locations: locationsPayload
            })
        });

        const data = await res.json();
        console.log("추천 응답:", data);

        if (!data || !data.center || !data.places) {
            alert("서버에서 잘못된 응답을 받았습니다.");
            return;
        }

        showCenterAndPlaces(data.center, data.places);

    } catch (e) {
        console.error(e);
        alert("추천 요청 중 오류가 발생했습니다.");
    }
}


// 3) 중심 + 장소 표시
function showCenterAndPlaces(center, places) {
    if (centerMarker) {
        centerMarker.setMap(null);
    }
    placeMarkers.forEach(m => m.setMap(null));
    placeMarkers = [];

    const centerLatLng = new kakao.maps.LatLng(center.lat, center.lng);
    centerMarker = new kakao.maps.Marker({
        position: centerLatLng,
        map: map
    });

    map.setCenter(centerLatLng);

    places.forEach((place, index) => {
        const latlng = new kakao.maps.LatLng(place.lat, place.lng);
        const marker = new kakao.maps.Marker({
            position: latlng,
            map: map
        });

        placeMarkers.push(marker);

        const iwContent = `
            <div style="padding:5px;font-size:12px;">
                <b>${index + 1}. ${place.name}</b><br/>
                거리: ${place.distance.toFixed(2)} km
            </div>
        `;
        const infowindow = new kakao.maps.InfoWindow({ content: iwContent });

        kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(map, marker));
        kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
        // ✅ 추천 장소 마커 클릭 시 경로 설정
kakao.maps.event.addListener(marker, 'click', () => {
    const ok = confirm(`'${place.place_name}' 까지의 경로를 보시겠습니까?`);
    if (ok) {

        // ⭐ [추가] 클릭한 곳의 인기(popularity) 증가 요청
        fetch("/api/meetup/popularity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kakao_id: place.id })
        });

        // 기존 경로 표시 기능
        setRouteTo(lat, lng, place.place_name);
    }
});


    });

    document.getElementById('info').innerText =
        `중심 좌표: (${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}) / 추천 장소 수: ${places.length}`;
}

// 4) 검색 기능
// 🔍 4) Kakao API로 장소 검색
function searchPlaces() {
    const keyword = document.getElementById('searchKeyword').value.trim();
    const category = document.getElementById('searchCategory').value;
    const resultsDiv = document.getElementById('searchResults');

    if (!keyword) {
        alert("검색 키워드를 입력하세요.");
        return;
    }
    if (!placesService) {
        alert("Kakao Places 서비스가 초기화되지 않았습니다.");
        return;
    }

    // 🔹 기존 검색 마커 제거
    searchMarkers.forEach(m => m.setMap(null));
    searchMarkers = [];
    resultsDiv.innerHTML = "검색 중...";

    // 🔹 카테고리를 Kakao category_group_code 로 매핑 (선택)
    //   cafe -> CE7(카페), food -> FD6(음식점), study -> AC5(학원/교육) 정도로 예시
    let categoryCode = null;
    if (category === "cafe") categoryCode = "CE7";
    else if (category === "food") categoryCode = "FD6";
    else if (category === "study") categoryCode = "AC5";

    const options = {
        location: map.getCenter(),   // 현재 지도 중심 기준
        radius: 3000,                // 3km 반경
    };
    if (categoryCode) {
        options.category_group_code = categoryCode;
    }

    console.log("Kakao 검색 요청:", { keyword, options });

    placesService.keywordSearch(keyword, (data, status, pagination) => {
        if (status !== kakao.maps.services.Status.OK) {
            console.warn("검색 결과 없음 또는 오류:", status);
            resultsDiv.innerHTML = `<p style="font-size:0.85rem; color:#666;">검색 결과가 없습니다.</p>`;
            return;
        }

        console.log("Kakao 검색 결과:", data);

        // 결과 리스트 HTML
        let html = '<ul style="list-style:none; padding-left:0; margin:0;">';

        data.forEach((place, idx) => {
            const lat = parseFloat(place.y);
            const lng = parseFloat(place.x);

            // 🔹 지도에 마커 표시
            const latlng = new kakao.maps.LatLng(lat, lng);
            const marker = new kakao.maps.Marker({
                position: latlng,
                map: map
            });
            searchMarkers.push(marker);

            const iw = new kakao.maps.InfoWindow({
                content: `<div style="padding:3px;font-size:12px;">${place.place_name}</div>`
            });
            kakao.maps.event.addListener(marker, 'mouseover', () => iw.open(map, marker));
            kakao.maps.event.addListener(marker, 'mouseout', () => iw.close());
            // ✅ 마커 클릭 시 경로 설정 여부 묻기
             kakao.maps.event.addListener(marker, 'click', () => {
            const ok = confirm(`'${place.place_name}' 까지의 경로를 보시겠습니까?`);
            if (ok) {
                setRouteTo(lat, lng, place.place_name);
            }
});

            // 🔹 결과 리스트 항목
            html += `
                <li style="margin-bottom:6px; cursor:pointer;"
                    onclick="focusPlace(${lat}, ${lng})">
                    <b>${idx + 1}. ${place.place_name}</b><br>
                    <span style="font-size:0.8rem; color:#555;">
                        ${place.category_group_name || ''} / ${place.address_name || place.road_address_name || ''}
                    </span>
                </li>
            `;
        });

        html += '</ul>';
        resultsDiv.innerHTML = html;

        // 🔹 첫 번째 결과 기준으로 지도 중심 이동
        const first = data[0];
        const firstLatLng = new kakao.maps.LatLng(parseFloat(first.y), parseFloat(first.x));
        map.setCenter(firstLatLng);
        map.setLevel(4);
    }, options);
}


// 5) 검색 결과 클릭 시 지도 이동
function focusPlace(lat, lng) {
    console.log("focusPlace 호출:", lat, lng);

    const latlng = new kakao.maps.LatLng(lat, lng);
    map.setCenter(latlng);
    map.setLevel(4);
}
window.focusPlace = focusPlace;

function afterLogin() {
    const overlay = document.getElementById("loginOverlay");
    const roomInfo = document.getElementById("roomInfo");

    if (overlay) overlay.style.display = "none";

    if (roomInfo && currentRoomCode && currentNickname) {
        roomInfo.textContent = `방 코드: ${currentRoomCode} / 닉네임: ${currentNickname}`;
    }

    console.log("로그인 완료:", { currentRoomCode, currentNickname });

    // ✅ 로그인 완료 후 WebSocket 연결
    connectSocket();
}
function connectSocket() {
    if (socket) {
        console.log("이미 소켓이 연결되어 있습니다.");
        return;
    }

    socket = io();

    socket.on("connect", () => {
        console.log("✅ Socket.IO 연결됨:", socket.id);

        if (currentRoomCode && currentNickname) {
            socket.emit("joinRoom", {
                roomCode: currentRoomCode,
                nickname: currentNickname
            });
        }
    });

    // 📍 위치 목록 업데이트 (모든 참가자)
    socket.on("locationsUpdate", (locations) => {
        console.log("📍 locationsUpdate:", locations);

        participantMarkers.forEach(m => m.setMap(null));
        participantMarkers = [];

        participantOverlays.forEach(ov => ov.setMap(null));
        participantOverlays = [];

        locations.forEach(loc => {
            const latlng = new kakao.maps.LatLng(loc.lat, loc.lng);

            const marker = new kakao.maps.Marker({
                position: latlng,
                map: map
            });
            participantMarkers.push(marker);

            const overlay = new kakao.maps.CustomOverlay({
                position: latlng,
                yAnchor: 1.2,
                content: `
                    <div style="
                        padding:2px 6px;
                        font-size:12px;
                        background:rgba(255,255,255,0.9);
                        border:1px solid #666;
                        border-radius:4px;
                        white-space:nowrap;
                    ">
                        ${loc.nickname}
                    </div>
                `
            });
            overlay.setMap(map);
            participantOverlays.push(overlay);
        });
    });

    // 👥 참가자 목록 업데이트
    socket.on("participantsUpdate", (list) => {
        console.log("👥 participantsUpdate:", list);
        participants = list;
        renderParticipants();
    });
}



function updateRoomInfoUI() {
    const roomInfo = document.getElementById("roomInfo");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (!roomInfo) return;

    if (currentRoomCode && currentNickname) {
        roomInfo.textContent =
            `방 코드: ${currentRoomCode} / 닉네임: ${currentNickname}` +
            (participants.length ? ` / 참여 인원: ${participants.length}명` : "");

        if (loginBtn) loginBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
        roomInfo.textContent = "로그인 후 방 정보가 표시됩니다.";
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
    }
}

function restoreSession() {
    const savedNickname = localStorage.getItem("meetupNickname");
    const savedRoomCode = localStorage.getItem("meetupRoomCode");

    if (savedNickname && savedRoomCode) {
        currentNickname = savedNickname;
        currentRoomCode = savedRoomCode;
        console.log("🔄 localStorage에서 세션 복구:", { currentRoomCode, currentNickname });

        updateRoomInfoUI();
        connectSocket(); // 자동 방 참가
    } else {
        updateRoomInfoUI();
    }
}






// ✅ 방 만들기
async function handleCreateRoom() {
    const nicknameInput = document.getElementById("nicknameInput");
    const errorEl = document.getElementById("loginError");
    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        errorEl.textContent = "닉네임을 입력하세요.";
        return;
    }

    try {
        const res = await fetch("/api/rooms/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            errorEl.textContent = data.message || "방 생성에 실패했습니다.";
            return;
        }

        currentNickname = nickname;
        currentRoomCode = data.room.code;

        afterLogin();

    } catch (e) {
        console.error(e);
        errorEl.textContent = "서버 오류로 방 생성에 실패했습니다.";
    }
}

// ✅ 방 참가
async function handleJoinRoom() {
    const nicknameInput = document.getElementById("nicknameInput");
    const roomCodeInput = document.getElementById("roomCodeInput");
    const errorEl = document.getElementById("loginError");

    const nickname = nicknameInput.value.trim();
    const roomCodeRaw = roomCodeInput.value.trim();

    if (!nickname) {
        errorEl.textContent = "닉네임을 입력하세요.";
        return;
    }
    if (!roomCodeRaw) {
        errorEl.textContent = "참가할 방 코드를 입력하세요.";
        return;
    }

    try {
        const res = await fetch("/api/rooms/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nickname,
                roomCode: roomCodeRaw.toUpperCase()
            })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            errorEl.textContent = data.message || "방 참가에 실패했습니다.";
            return;
        }

        currentNickname = nickname;
        currentRoomCode = data.room.code;

        afterLogin();

    } catch (e) {
        console.error(e);
        errorEl.textContent = "서버 오류로 방 참가에 실패했습니다.";
    }
}

// 🔹 onclick="focusPlace(...)" 에서 쓸 수 있도록 전역에 노출
window.focusPlace = focusPlace;

function renderParticipants() {
    const box = document.getElementById("x  ");

    if (!box) return;

    if (!participants || participants.length === 0) {
        box.innerHTML = `<p style="font-size:0.85rem; color:#666;">현재 참여 인원이 없습니다.</p>`;
    } else {
        let html = `<p>총 <b>${participants.length}</b>명 참여중</p><ul style="padding-left:16px; margin:4px 0;">`;

        participants.forEach(p => {
            if (p.lat != null && p.lng != null) {
                html += `<li>${p.nickname} — (${p.lat.toFixed(4)}, ${p.lng.toFixed(4)})</li>`;
            } else {
                html += `<li>${p.nickname} — 위치 미등록</li>`;
            }
        });

        html += `</ul>`;
        box.innerHTML = html;
    }

    // 🔁 상단 정보도 갱신
    updateRoomInfoUI();
}

window.addMyLocation = addMyLocation;
window.addMyLocation = addMyLocation;

