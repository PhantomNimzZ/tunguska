const router = require("express").Router();
const { getVenues, getVenueBySlug, getVenueAvailability } = require("../controllers/venue.controller");

router.get("/", getVenues);
router.get("/:slug", getVenueBySlug);
router.get("/:slug/availability", getVenueAvailability);

module.exports = router;
