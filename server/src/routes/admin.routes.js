const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { authenticate, authorizeAdmin } = require("../middleware/auth.middleware");
const {
  getUsers, updateUser, createUser,
  getAllVenues, createVenue, updateVenue, deleteVenue,
  getAllBookings, createBookingAsAdmin, approveBooking, declineBooking, updatePaymentStatus,
  createCategory, updateCategory, createSportType, updateSportType,
  uploadVenueImage, getVenueImages, setImagePrimary, deleteVenueImage,
  getDashboardStats,
} = require("../controllers/admin.controller");

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `venue-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(ext && mime ? null : new Error("Only JPEG, PNG, and WebP images allowed."), ext && mime);
  },
});

// All admin routes require authentication + admin role
router.use(authenticate, authorizeAdmin);

// Dashboard
router.get("/stats", getDashboardStats);

// Users
router.get("/users", getUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);

// Venues
router.get("/venues", getAllVenues);
router.post("/venues", createVenue);
router.put("/venues/:id", updateVenue);
router.delete("/venues/:id", deleteVenue);

// Venue images
router.get("/venues/:id/images", getVenueImages);
router.post("/venues/:id/images", upload.single("image"), uploadVenueImage);
router.patch("/venues/:venueId/images/:imageId/primary", setImagePrimary);
router.delete("/venues/:venueId/images/:imageId", deleteVenueImage);

// Bookings
router.get("/bookings", getAllBookings);
router.post("/bookings", createBookingAsAdmin);
router.patch("/bookings/:id/approve", approveBooking);
router.patch("/bookings/:id/decline", declineBooking);
router.patch("/bookings/:id/payment", updatePaymentStatus);

// Categories & Sport Types
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.post("/sport-types", createSportType);
router.put("/sport-types/:id", updateSportType);

module.exports = router;
