const mongoose = require("mongoose");
const FishSchema = new mongoose.Schema(
    {
        name: {
            type : String,
            required : true
        },
        image: {
            type : String,
            required : true
        }
    }
);
const FishContact = mongoose.model("FishDB",FishSchema);
module.exports = FishContact;