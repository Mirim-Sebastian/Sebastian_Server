require("dotenv").config({path: "./config.env"});

const express = require("express");
const cors = require('cors');
const {MongoClient} = require("mongodb");

const app = express();
app.use(express.json());
app.use(cors());

const ServerClient = new MongoClient(process.env.DB_URI);
const dbName = "Sebastian";
export async function RunDB(){
    try{
        await ServerClient.connect();
        console.log("MongoDB 연결 완료");

        app.locals.db = ServerClient.db(dbName);

        app.listen(5000, () => {
            console.log("서버 실행 중..");
        });
        
    } catch (e){
        console.error("DB 연결 실패 : ", e);
        process.exit(1);
    }
}