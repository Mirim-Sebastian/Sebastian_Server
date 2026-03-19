const express = require("express");
const FishRouter = require("./routes/router");
const dbConnect = require("./config/mongoDB");
const app = express();
const PORT = 8000;
dbConnect();
app.use(express.json());


// API 라우터 연결
app.use("/", FishRouter);

app.listen(PORT, ()=>{
    console.log(`http://localhost:${PORT}`);
});
//npm install dotenv mongoose express