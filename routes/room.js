const express = require("express");
const authentication = require("../middleware/authentication");
const router = express.Router();
const RoomControllers = require("../controllers/room");

router.get("/get-all-rooms", authentication, RoomControllers.getAllRooms);

router.post("/create-room", authentication, RoomControllers.addRoom);

router.get(
  "/get-daily-schedule",
  authentication,
  RoomControllers.getDailySchedule
);

router.delete("/delete-room", authentication, RoomControllers.deleteRoom);
module.exports = router;
