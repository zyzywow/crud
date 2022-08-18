const path = require("path");
const express = require("express");
const ejs = require("ejs");
const app = express();
const dotenv = require("dotenv").config();

// mongodb 관련 모듈
const MongoClient = require("mongodb").MongoClient;

let db = null;
MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  console.log("연결");
  if (err) {
    console.log(err);
  }
  db = client.db("crudapp");
}); // db연결 끝---------------------

app.use(express.urlencoded({ extended: false }));
// post방식으로 가져온값 출력하려면 위 내용 !
app.set("view engine", "ejs");

app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");

app.get("/", (req, res) => {
  res.send("hello node");
});
app.get("/write", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/write.html"));
  // 경로자동으로찾아주는 수단  path ../,/등등알아서바꿔줌 path는 node기본탑재
  // __dirname -> 내가사용하고있는 폴더까지가 경로임, ex)crud,hitop
});

app.post("/add", (req, res) => {
  const subject = req.body.subject;
  const contents = req.body.contents;
  // post 폼데이터받을때 무조건 바디로받고 name으로받기 그래서form, name설정중요
  console.log(subject);
  console.log(contents);

  // insertOne-1개넣겠다. mongodb는 method로제공함 sql과다르게
  // insertMany - 여러개넣겠다. mongodb는 object형식으로 넣어야함.
  const insertData = {
    subject: subject,
    contents: contents,
  };
  db.collection("crud").insertOne(insertData, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.log("잘 들어갔음.");
  });

  // 1. db접속
  // 2. 받은 데이터 밀어넣기
  // res.sendFile(path.join(__dirname, "public/html/result.html"));
  res.send(`<script>alert("글이 입력되었습니다."); location.href="/list"</script>`);
  // 브라우저에서 사용되는 스크립트내용은 node에선 사용할수 없어서 위 처럼 쓰거나 해야함.
  // res첫번째응답하면 그 밑의 res들은 실행되지않음. res2번못씀,
  // res.redirect("/list");
  // redirect->글 내용입력 후 중간페이지 거치지않고 글내용업데이트와동시에 바로이동하기
});
app.get("/list", (req, res) => {
  // crud에서 data 받아보기 ,find() <-싹다찾아줌
  db.collection("crud")
    .find()
    .toArray((err, result) => {
      console.log(result);
      // res.json(result); // front가 알아서 처리해서 가져다 쓰기
      res.render("list", { list: result, title: "테스트용입니다." }); //페이지를 내가 만들어서 보내주는 것
    });
});
app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 대기중`);
});
