// South African phone: 0XX XXX XXXX or +27XX XXX XXXX
const SA_PHONE_REGEX = /^(\+27|0)[1-9][0-9]{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = {
  email(value) {
    if (!value) return "Email is required.";
    if (!EMAIL_REGEX.test(value)) return "Invalid email format.";
    return null;
  },

  phone(value) {
    if (!value) return null; // phone is optional
    const cleaned = value.replace(/[\s\-()]/g, "");
    if (!SA_PHONE_REGEX.test(cleaned)) {
      return "Invalid phone number. Use format: 0XX XXX XXXX or +27XX XXX XXXX.";
    }
    return null;
  },

  required(value, fieldName) {
    if (!value || (typeof value === "string" && !value.trim())) {
      return `${fieldName} is required.`;
    }
    return null;
  },

  slug(value) {
    if (!value) return "Slug is required.";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      return "Slug must be lowercase letters, numbers, and hyphens only.";
    }
    return null;
  },

  positiveNumber(value, fieldName) {
    if (value === null || value === undefined || value === "") return null;
    const num = Number(value);
    if (isNaN(num) || num < 0) return `${fieldName} must be a positive number.`;
    return null;
  },

  // Run multiple validations, return first error or null
  run(...checks) {
    for (const error of checks) {
      if (error) return error;
    }
    return null;
  },
};

module.exports = validate;
