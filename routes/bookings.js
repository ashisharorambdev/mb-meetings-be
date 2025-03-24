const express = require("express");
const authentication = require("../middleware/authentication");
const router = express.Router();
const BookingsControllers = require("../controllers/bookings");

router.post(
  "/create-booking",
  authentication,
  BookingsControllers.createBooking
);

router.get(
  "/get-my-bookings",
  authentication,
  BookingsControllers.getMyBookings
);

router.get(
  "/get-all-bookings",
  authentication,
  BookingsControllers.getAllBookings
);

router.delete(
  "/delete-booking",
  authentication,
  BookingsControllers.deleteBooking
);

router.patch(
  "/update-booking/:id",
  authentication,
  BookingsControllers.updateBooking
);

module.exports = router;
