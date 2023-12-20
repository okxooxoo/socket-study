import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug"); // pug 템플릿 엔진 사용
app.set("views", __dirname + "/views"); // pug 파일을 담을 views 폴더 위치 알려주기
app.use("/public", express.static(__dirname + "/public"));

const handleListen = () => console.log("3000 포트에서 실행 중...");

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function onSocketClose() {
    console.log("Disconnected from the Browser ❌");
}

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    console.log("Connected to Browser ✅");
    socket.on("close", onSocketClose);
    socket.on("message", (message) => {
        sockets.forEach(aSocket => aSocket.send(message.toString()));
    });
});

server.listen(3000, handleListen);