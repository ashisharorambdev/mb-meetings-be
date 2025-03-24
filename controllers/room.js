const Room = require("../models/room");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");
const validateRoom = require("../validators/room");
const Booking = require("../models/booking");
const moment = require("moment");

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json({
      data: rooms,
      statusCode: 200,
      error: false,
      message: "success",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      error: true,
      message: `Server error ${err.message}`,
    });
  }
};

exports.addRoom = async (req, res) => {
  const { roomName, roomImage } = req.body;
  const addedBy = req.user.id;

  const lastRoom = await Room.findOne().sort({ roomId: -1 });
  const roomId = lastRoom ? lastRoom.roomId + 1 : 1;

  let data = {
    roomName: roomName,
    roomId: roomId,
    roomImage: roomImage ?? "",
    addedBy: parseInt(addedBy),
  };

  try {
    const { error } = validateRoom(data);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        statusCode: 400,
        error: false,
      });
    }
    const room = new Room(data);

    await room.save();

    res.status(200).json({
      statusCode: 200,
      error: false,
      message: "Room created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      error: true,
      message: `Server error ${err.message}`,
    });
  }
};

exports.getDailySchedule = async (req, res) => {
  if (!req.query.date) {
    return res.status(400).json({
      statusCode: 400,
      error: true,
      message: "Date parameter is required.",
    });
  }

  try {
    const rooms = await Room.find();
    const startDate = moment(req.query.date)
      .subtract({
        hours: 5,
        minutes: 30,
      })
      .utc();

    const endDate = moment(startDate).add(24, "hours").utc();
    // endDate.setDate(endDate.getDate() + 1);

    const bookings = await Booking.find({
      startDateTime: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const userPromises = bookings.map((booking) => {
      return User.find({ id: booking.bookedBy })
        .exec()
        .then((user) => {
          return {
            ...booking.toObject(),
            bookedBy: user,
          };
        });
    });

    // Execute all the promises
    const populatedBookings = await Promise.all(userPromises);

    res.status(200).json({
      data: {
        allRooms: rooms,
        bookings: populatedBookings,
      },
      statusCode: 200,
      error: false,
      message: "success",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      error: true,
      message: `Server error ${err.message}`,
    });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(400).json({
        statusCode: 400,
        error: true,
        message: "id parameter is required.",
      });
    }

    const room = await Room.findOne({ roomId: req.query.id });
    if (!room) {
      return res
        .status(404)
        .json({ message: "Room not found", statusCode: 404, error: true });
    }

    await Booking.deleteMany({ roomId: req.query.id });

    await room.remove();

    res.status(200).json({
      statusCode: 200,
      error: false,
      message: "Room successfully deleted",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      error: true,
      message: `Server error ${err.message}`,
    });
  }
};
