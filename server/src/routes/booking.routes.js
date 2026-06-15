const router = require("express").Router();
const { createBooking, getMyBookings, getBookingById, cancelBooking } = require("../controllers/booking.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);

router.post("/", createBooking);
router.get("/", getMyBookings);
router.get("/:id", getBookingById);
router.patch("/:id/cancel", cancelBooking);

module.exports = router;
