import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug"); // pug 템플릿 엔진 사용
app.set("views", __dirname + "/views"); // pug 파일을 담을 views 폴더 위치 알려주기
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function onSocketClose() {
  console.log("Disconnected from the Browser ❌");
}

/**
 * 공개방 리스트를 반환하는 함수
 */
function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

/**
 * 방의 인원수를 반환하는 함수
 */
function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon"; // 소켓 연결시 닉네임 익명으로 설정

  // 소켓이 모든 이벤트에 대하여 아래 코드 실행
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  // 소켓이 "enter_room" 이벤트에 대하여 아래 코드 실행
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done(); // 프론트엔드에서 done 함수가 실행된다.
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });

  // 소켓이 "disconnecting" 이벤트(연결이 끊어지기 직전)에 대하여 아래 코드 실행
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
    });
  });

  // 소켓이 "disconnect" 이벤트(연결이 끊어진 후)에 대하여 아래 코드 실행
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  // 소켓이 "new_message" 이벤트에 대하여 아래 코드 실행
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  // 소켓이 "nickname" 이벤트에 대하여 아래 코드 실행
  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  });
});

const handleListen = () => console.log("3000 포트에서 실행 중...");
httpServer.listen(3000, handleListen);
