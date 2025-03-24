const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: Number,
    required: true,
  },
  roomId: {
    type: Number,
    ref: "Room",
    required: true,
  },
  bookedBy: {
    type: Number,
    ref: "User",
    required: true,
  },
  startDateTime: {
    type: Date,
    required: true,
  },
  endDateTime: {
    type: Date,
    required: true,
  },

  meetingTitle: {
    type: String,
    required: true,
  },
});

bookingSchema.set("timestamps", true);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
