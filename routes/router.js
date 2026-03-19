const ex = require("express");
const router = ex.Router(); 
const Fish = require("../models/FishDB");

//Get 물고기 개수 조회(사용자 수 카운트)
router
    .route("/fish/count")
    .get(async(req,res)=>{
        try{
            const userCount = await Fish.countDocuments();
            res.json(userCount);
        }catch(error){
            res.status(500)
        }
    });
    
//POST 물고기 생성
router
    .route("/fish")
    .post(async(req,res)=>{
        try{
            const {name,image} = req.body;
            const fish = new Fish({
                name,
                image
            });
            const savedFish = await fish.save(); //추가 사용자 저장하기
            res.status(201).json(savedFish);
        }catch(error){
            console.error(error);
            res.status(400).json({message: error.message});
        }
    });

//Get 물고기 목록 조회
router
    .route("/fish")
    .get(async(req,res)=>{
        try{
            const fishes = await Fish.find();
            res.json(fishes);
        }catch(error){
            console.error(error);
            res.status(500)
        }
    });
module.exports = router;