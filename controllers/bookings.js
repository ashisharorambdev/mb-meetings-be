const Booking = require("../models/booking");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");
const {
  checkBookingOverlap,
  checkExistingBookingsWithinRange,
} = require("../utils/dateFinder");
const transporter = require("../transporter/mailSender");
const Room = require("../models/room");
const moment = require("moment");

function subtractOneSecondFromDate(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error("Invalid date object.");
  }

  // Get the timestamp of the current date and subtract one second (1000 milliseconds) from it
  const newTimestamp = date.getTime() - 1000;

  // Create a new Date object using the updated timestamp
  const newDate = new Date(newTimestamp);

  return newDate;
}

function addOneSecondFromDate(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error("Invalid date object.");
  }

  // Get the timestamp of the current date and subtract one second (1000 milliseconds) from it
  const newTimestamp = date.getTime() + 1000;

  // Create a new Date object using the updated timestamp
  const newDate = new Date(newTimestamp);

  return newDate;
}

exports.createBooking = async (req, res) => {
  const { startDateTime, endDateTime, meetingTitle, roomId } = req.body;
  const bookedBy = req.user.id;

  const lastBooking = await Booking.findOne().sort({ bookingId: -1 });
  const bookingId = lastBooking ? lastBooking.bookingId + 1 : 1;
  const room = await Room.findOne({ roomId: roomId });

  let data = {
    startDateTime,
    endDateTime,
    meetingTitle,
    roomId,
    bookedBy,
    bookingId,
  };

  try {
    if (new Date(endDateTime) < new Date(startDateTime)) {
      return res.status(400).json({
        statusCode: 400,
        error: true,
        message: "endDateTime can't be before startDateTime",
      });
    }

    if (endDateTime === startDateTime) {
      return res.status(400).json({
        statusCode: 400,
        error: true,
        message: "startDateTime and endDateTime can't be same",
      });
    }

    const hasOverlap = await checkBookingOverlap(
      addOneSecondFromDate(new Date(startDateTime)),
      subtractOneSecondFromDate(new Date(endDateTime)),
      roomId
    );

    if (hasOverlap) {
      return res.status(400).json({
        statusCode: 400,
        error: true,
        message: "The new booking overlaps with existing bookings.",
      });
    }

    const hasExistingBookingWithinRange =
      await checkExistingBookingsWithinRange(
        addOneSecondFromDate(new Date(startDateTime)),
        subtractOneSecondFromDate(new Date(endDateTime)),
        roomId
      );

    if (hasExistingBookingWithinRange) {
      return res.status(400).json({
        statusCode: 400,
        error: true,
        message:
          "An existing booking lies within the range of the new booking.",
      });
    }

    const booking = new Booking(data);

    await booking.save();

    const mailOptions = {
      from: "aashisha9860@gmail.com", // Replace with your Gmail email
      to: "ashish.arora@mindbowser.com", // Replace with the recipient's email
      subject: "Booking confirmation || Meeting By Mindbowser",
      text: `Your booking for ${
        room.roomName
      } has been confirmed for ${meetingTitle} between time slot of ${moment(
        startDateTime,
        "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
      ).format("MMMM Do YYYY,HH:mm a")} - ${moment(
        endDateTime,
        "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
      ).format("MMMM Do YYYY,HH:mm a")}`,
    };

    // Send the email using the reusable transporter
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email." });
      } else {
        console.log("Email sent:", info.response);
        res.status(200).json({ message: "Email sent successfully." });
      }
    });
    res.status(200).json({
      statusCode: 200,
      error: false,
      message: "Booking created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      error: true,
      message: `Server error ${err.message}`,
    });
  }
};

exports.getMyBookings = async (req, res) => {
  const user = req.user.id;
  try {
    const myBookings = await Booking.aggregate([
      {
        $match: {
          bookedBy: parseInt(user),
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "roomId",
          as: "room",
        },
      },
      {
        $unwind: "$room",
      },
    ]);

    res.status(200).json({
      data: myBookings,
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

exports.getAllBookings = async (req, res) => {
  try {
    const allBookings = await Booking.aggregate([
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "roomId",
          as: "room",
        },
      },
      {
        $unwind: "$room",
      },
    ]);

    res.status(200).json({
      data: allBookings,
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

exports.deleteBooking = async (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(400).json({
        statusCode: 400,
        error: true,
        message: "id parameter is required.",
      });
    }

    const booking = await Booking.findOne({ bookingId: req.query.id });
    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found", statusCode: 404, error: true });
    }

    await booking.deleteOne();

    res.status(200).json({
      statusCode: 200,
      error: false,
      message: "Booking successfully deleted",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      error: true,
      message: `Server error ${err.message}`,
    });
  }
};

exports.updateBooking = async (req, res) => {
  const { startDateTime, endDateTime, meetingTitle, roomId } = req.body;
  const bookingId = req.params.id;

  const room = await Room.findOne({ roomId: roomId });

  let data = {
    startDateTime,
    endDateTime,
    meetingTitle,
    roomId,
    bookedBy,
    bookingId,
  };

  try {
    if (new Date(endDateTime) < new Date(startDateTime)) {
      return res.status(400).json({
        statusCode: 400,
        error: true,
        message: "endDateTime can't be before startDateTime",
      });
    }

    if (endDateTime === startDateTime) {
      return res.status(400).json({
        statusCode: 400,
        error: true,
        message: "startDateTime and endDateTime can't be same",
      });
    }

    const hasOverlap = await checkBookingOverlap(
      addOneSecondFromDate(new Date(startDateTime)),
      subtractOneSecondFromDate(new Date(endDateTime)),
      roomId
    );

    if (hasOverlap) {
      return res.status(400).json({
        statusCode: 400,
        error: true,
        message: "The new booking overlaps with existing bookings.",
      });
    }

    const hasExistingBookingWithinRange =
      await checkExistingBookingsWithinRange(
        addOneSecondFromDate(new Date(startDateTime)),
        subtractOneSecondFromDate(new Date(endDateTime)),
        roomId
      );

    if (hasExistingBookingWithinRange) {
      return res.status(400).json({
        statusCode: 400,
        error: true,
        message:
          "An existing booking lies within the range of the new booking.",
      });
    }

    if (!bookingId) {
      return res.status(404).json({
        statusCode: 400,
        error: true,
        message: "No booking found with this id",
      });
    }

    await Booking.findOneAndUpdate({ bookingId: bookingId }, data);

    const mailOptions = {
      from: "aashisha9860@gmail.com", // Replace with your Gmail email
      to: "ashish.arora@mindbowser.com", // Replace with the recipient's email
      subject: "Booking confirmation || Meeting By Mindbowser",
      text: `Your booking for ${
        room.roomName
      } has been updated for ${meetingTitle} between time slot of ${moment(
        startDateTime,
        "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
      ).format("MMMM Do YYYY,HH:mm a")} - ${moment(
        endDateTime,
        "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
      ).format("MMMM Do YYYY,HH:mm a")}`,
    };

    // Send the email using the reusable transporter
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email." });
      } else {
        console.log("Email sent:", info.response);
        res.status(200).json({ message: "Email sent successfully." });
      }
    });
    res.status(200).json({
      statusCode: 200,
      error: false,
      message: "Booking updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      error: true,
      message: `Server error ${err.message}`,
    });
  }
};
