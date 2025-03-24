const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: {
    type: Number,
    required: true,
  },
  roomName: {
    type: String,
    required: true,
  },
  addedBy: {
    type: Number,
    required: true,
  },
  roomImage: {
    type: String,
    required: false,
  },
});

roomSchema.set("timestamps", true);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
