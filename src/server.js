import express from "express";

const app = express();

app.set("view engine", "pug"); // pug 템플릿 엔진 사용
app.set("views", __dirname + "/views"); // pug 파일을 담을 views 폴더 위치 알려주기
app.use("/public", express.static(__dirname + "/public"));

const handleListen = () => console.log("3000 포트에서 실행 중...");
app.listen(3000, handleListen);

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));