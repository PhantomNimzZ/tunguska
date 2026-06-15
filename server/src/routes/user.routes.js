const router = require("express").Router();
const { updateProfile, changePassword } = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);

router.put("/profile", updateProfile);
router.put("/password", changePassword);

module.exports = router;
