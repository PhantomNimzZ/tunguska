const router = require("express").Router();
const { authenticate, authorizeAdmin } = require("../middleware/auth.middleware");
const {
  getUsers, updateUser,
  getAllVenues, createVenue, updateVenue, deleteVenue,
  getAllBookings, approveBooking, declineBooking, updatePaymentStatus,
  createCategory, createSportType,
  getDashboardStats,
} = require("../controllers/admin.controller");

// All admin routes require authentication + admin role
router.use(authenticate, authorizeAdmin);

// Dashboard
router.get("/stats", getDashboardStats);

// Users
router.get("/users", getUsers);
router.patch("/users/:id", updateUser);

// Venues
router.get("/venues", getAllVenues);
router.post("/venues", createVenue);
router.put("/venues/:id", updateVenue);
router.delete("/venues/:id", deleteVenue);

// Bookings
router.get("/bookings", getAllBookings);
router.patch("/bookings/:id/approve", approveBooking);
router.patch("/bookings/:id/decline", declineBooking);
router.patch("/bookings/:id/payment", updatePaymentStatus);

// Categories & Sport Types
router.post("/categories", createCategory);
router.post("/sport-types", createSportType);

module.exports = router;
