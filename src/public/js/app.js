const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

/**
 * 메시지를 ul 안에 추가하여 화면에 나타낸다.
 */
function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

/**
 * 닉네임 전송 버튼 클릭시 서버에 "nickname" 이벤트 전송
 */
function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#name input");
    const value = input.value;
    socket.emit("nickname", input.value);
    input.value = "";
}

/**
 * 메시지 전송 버튼 클릭시 서버에 "new_message" 이벤트 전송
 */
function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

/**
 * 채팅방 제목 설정 및
 * 메시지 전송 버튼에 이벤트 리스너 부착
 */
function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);
}

/**
 * 방 들어가기 버튼 클릭시 서버에 "enter_room" 이벤트 전송
 */
function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
    addMessage(`${user} arrived!`);
});

socket.on("bye", (user) => {
    addMessage(`${user} left ㅠㅠ`);
});

socket.on("new_message", addMessage);