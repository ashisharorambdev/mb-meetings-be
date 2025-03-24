const Booking = require("../models/booking");

async function checkBookingOverlap(startDateTime, endDateTime, roomId) {
  try {
    // Find all bookings that have startDateTime or endDateTime between the new startDateTime and endDateTime
    const overlappingBookings = await Booking.find({
      roomId: roomId,
      $or: [
        {
          startDateTime: {
            $gte: new Date(startDateTime),
            $lt: new Date(endDateTime),
          },
        },
        {
          endDateTime: {
            $gt: new Date(startDateTime),
            $lte: new Date(endDateTime),
          },
        },
      ],
    });

    return overlappingBookings.length > 0;
  } catch (err) {
    throw err;
  }
}

async function checkExistingBookingsWithinRange(
  startDateTime,
  endDateTime,
  roomId
) {
  try {
    // Find all bookings that have startDateTime or endDateTime within the range of the new startDateTime and endDateTime
    const existingBookingsWithinRange = await Booking.find({
      roomId: roomId,
      $or: [
        {
          startDateTime: { $lte: new Date(startDateTime) },
          endDateTime: { $gte: new Date(startDateTime) },
        },
        {
          startDateTime: { $lte: new Date(endDateTime) },
          endDateTime: { $gte: new Date(endDateTime) },
        },
        {
          startDateTime: { $gte: new Date(startDateTime) },
          endDateTime: { $lte: new Date(endDateTime) },
        },
      ],
    });

    return existingBookingsWithinRange.length > 0;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  checkBookingOverlap,
  checkExistingBookingsWithinRange,
};
