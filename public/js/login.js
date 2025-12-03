console.log("✅ login.js 로드됨");

window.addEventListener("DOMContentLoaded", () => {
    const nicknameInput = document.getElementById("nicknameInput");
    const roomCodeInput = document.getElementById("roomCodeInput");
    const createRoomBtn = document.getElementById("createRoomBtn");
    const joinRoomBtn = document.getElementById("joinRoomBtn");
    const errorEl = document.getElementById("loginError");

    // 이미 로그인 돼 있으면 바로 메인으로
    const savedNickname = localStorage.getItem("meetupNickname");
    const savedRoom = localStorage.getItem("meetupRoomCode");
    if (savedNickname && savedRoom) {
        location.href = "/index.html";
        return;
    }

    createRoomBtn.addEventListener("click", async () => {
        const nickname = nicknameInput.value.trim();
        errorEl.textContent = "";

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

            // 🔐 세션 저장
            localStorage.setItem("meetupNickname", nickname);
            localStorage.setItem("meetupRoomCode", data.room.code);

            // 메인 페이지로 이동
            location.href = "/index.html";
        } catch (e) {
            console.error(e);
            errorEl.textContent = "서버 오류로 방 생성에 실패했습니다.";
        }
    });

    joinRoomBtn.addEventListener("click", async () => {
        const nickname = nicknameInput.value.trim();
        const roomCodeRaw = roomCodeInput.value.trim();
        errorEl.textContent = "";

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

            localStorage.setItem("meetupNickname", nickname);
            localStorage.setItem("meetupRoomCode", data.room.code);

            location.href = "/index.html";
        } catch (e) {
            console.error(e);
            errorEl.textContent = "서버 오류로 방 참가에 실패했습니다.";
        }
    });
});
