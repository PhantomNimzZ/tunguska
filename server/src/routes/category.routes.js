const router = require("express").Router();
const { getCategories, getCategoryBySlug, getSportTypesByCategory } = require("../controllers/category.controller");

router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);
router.get("/:slug/sport-types", getSportTypesByCategory);

module.exports = router;
