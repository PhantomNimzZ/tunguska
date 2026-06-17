const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const validate = require("../utils/validate");

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const error = validate.run(
      validate.required(firstName, "First name"),
      validate.required(lastName, "Last name"),
      validate.phone(phone),
    );
    if (error) return res.status(400).json({ success: false, message: error });

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone ? phone.replace(/[\s\-()]/g, "") : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const error = validate.run(
      validate.required(currentPassword, "Current password"),
      validate.required(newPassword, "New password"),
    );
    if (error) return res.status(400).json({ success: false, message: error });

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, changePassword };
