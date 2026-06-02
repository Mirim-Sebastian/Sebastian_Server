const ex = require("express");
const Fish = require("../models/FishDB");

module.exports = (wss) => {
  const router = ex.Router();

  // ─── 관리자 대시보드: 통계 조회 ───────────────────────────────────────
  router.route("/admin/stats").get(async (req, res) => {
    try {
      const totalUsers = await Fish.countDocuments();
      const fishBySize = await Fish.aggregate([
        { $group: { _id: "$size", count: { $sum: 1 } } },
      ]);
      const recentFish = await Fish.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("name size createdAt message");

      const stats = {
        totalUsers,
        fishBySize: fishBySize.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentFish,
        updatedAt: new Date().toISOString(),
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

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

  //Delete 물고기 삭제 + WebSocket 브로드캐스트
  router.route("/fish/:id").delete(async (req, res) => {
    try {
      const deletedFish = await Fish.findByIdAndDelete(req.params.id);
      
      if (!deletedFish) {
        return res.status(404).json({ message: "물고기를 찾을 수 없습니다." });
      }

      // 삭제된 물고기를 모든 클라이언트에 알림
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: "FISH_DELETED", data: { id: req.params.id } }));
        }
      });

      res.status(200).json({ message: "물고기가 삭제되었습니다.", deletedFish });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
