const mongoose = require('mongoose')
require("dotenv").config(); //env값 가져오기

const dbConnect = async () =>{
    try{
        const con = await mongoose.connect(process.env.DB_URI)
        console.log("DB 성공");
    }catch(error){
        console.log(error);
    }
}
module.exports = dbConnect
