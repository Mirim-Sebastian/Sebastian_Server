const ex = require("express");
const Fish = require("../models/FishDB");

module.exports = (wss) => {
  const router = ex.Router();

  //Get 물고기 개수 조회(사용자 수 카운트)
  router.route("/fish/count").get(async (req, res) => {
    try {
      const userCount = await Fish.countDocuments();
      res.json(userCount);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  //POST 물고기 생성 + WebSocket 브로드캐스트
  router.route("/fish").post(async (req, res) => {
    try {
      const { name, image, message, size } = req.body;
      const fish = new Fish({ name, image, message, size });
      const savedFish = await fish.save();

      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: "NEW_FISH", data: savedFish }));
        }
      });

      res.status(201).json(savedFish);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  });

  //Get 물고기 목록 조회
  router.route("/fish").get(async (req, res) => {
    try {
      const fishes = await Fish.find();
      res.json(fishes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  //Delete 물고기 삭제
  router.route("/fish/:id").delete(async (req, res) => {
    try {
      await Fish.findByIdAndDelete(req.params.id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
