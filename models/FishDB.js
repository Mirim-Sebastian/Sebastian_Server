const mongoose = require("mongoose");

const FishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    message: { type: String, required: true },
    size: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },
  },
  { timestamps: true },
);

FishSchema.index({ createdAt: -1 });

const FishContact = mongoose.model("FishDB", FishSchema);
module.exports = FishContact;
