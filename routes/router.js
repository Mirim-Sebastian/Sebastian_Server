const ex = require("express");
const Fish = require("../models/FishDB");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.DB_URI || process.env.DB_URL;
const sebastianClient = new MongoClient(uri);
let sebastianDb;
const MAX_FISH_LIMIT = 500;

// Sebastian DB 연결
(async () => {
  try {
    await sebastianClient.connect();
    sebastianDb = sebastianClient.db("Sebastian");
    console.log("Sebastian DB 연결 완료");
  } catch (error) {
    console.error("Sebastian DB 연결 실패:", error);
  }
})();

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

  router.route("/admin/fishes").get(async (req, res) => {
    try {
      const fishes = await Fish.find()
        .sort({ createdAt: -1 })
        .lean();
      res.json(fishes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.route("/admin/shark").post((req, res) => {
    const payload = JSON.stringify({
      type: "SPAWN_SHARK",
      allowProtectedTargets: true,
      deleteTargets: true,
    });
    let sent = 0;

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(payload);
        sent += 1;
      }
    });

    if (sent === 0) {
      return res.status(409).json({
        ok: false,
        sent,
        message: "연결된 바다 화면이 없습니다.",
      });
    }

    res.json({ ok: true, sent });
  });

  // Get 물고기 개수 조회(사용자 수 카운트)
  router.route("/fish/count").get(async (req, res) => {
    try {
      const userCount = await Fish.countDocuments();
      res.json(userCount);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST 물고기 생성 + WebSocket 브로드캐스트
  router.route("/fish").post(async (req, res) => {
    try {
      const { name, image, message, size } = req.body;

      // 1. 기존대로 test.fishdbs에 저장 (mongoose)
      const fish = new Fish({ name, image, message, size });
      const savedFish = await fish.save();

      // WebSocket 브로드캐스트
      const payload = JSON.stringify({ type: "NEW_FISH", data: savedFish });
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(payload);
        }
      });

      res.status(201).json(savedFish);

      // 2. Sebastian.fishs에도 동시 저장 (MongoClient). 보조 저장은 응답을 막지 않는다.
      if (sebastianDb) {
        sebastianDb.collection("fishs").insertOne({
          name,
          image,
          message,
          size,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).catch((error) => {
          console.error("Sebastian.fishs 저장 실패:", error);
        });
      } else {
        console.warn("Sebastian DB 미연결 상태 - Sebastian.fishs 저장 건너뜀");
      }
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get 물고기 목록 조회
  router.route("/fish").get(async (req, res) => {
    try {
      const requestedLimit = Number.parseInt(req.query.limit, 10);
      const limit = Number.isFinite(requestedLimit)
        ? Math.min(Math.max(requestedLimit, 1), MAX_FISH_LIMIT)
        : 250;
      const fishes = await Fish.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      res.json(fishes.reverse());
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Delete 물고기 삭제 + WebSocket 브로드캐스트
  router.route("/fish/:id").delete(async (req, res) => {
    try {
      const deletedFish = await Fish.findByIdAndDelete(req.params.id);

      if (!deletedFish) {
        return res.status(404).json({ message: "물고기를 찾을 수 없습니다." });
      }

      // 삭제된 물고기를 모든 클라이언트에 알림
      const payload = JSON.stringify({ type: "FISH_DELETED", data: { id: req.params.id } });
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(payload);
        }
      });

      res.status(200).json({ message: "물고기가 삭제되었습니다.", deletedFish });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
