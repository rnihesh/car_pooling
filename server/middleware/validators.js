// Simple validation helpers without external dependencies
const validators = {
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isPhoneNumber: (phone) => {
    const phoneRegex = /^\d{7,15}$/;
    return phoneRegex.test(phone);
  },

  isObjectId: (id) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  },

  isNotEmpty: (value) => {
    return value !== undefined && value !== null && value !== "";
  },

  isValidCoordinates: (coords) => {
    if (!Array.isArray(coords) || coords.length !== 2) return false;
    const [lng, lat] = coords;
    return (
      typeof lng === "number" &&
      typeof lat === "number" &&
      lng >= -180 &&
      lng <= 180 &&
      lat >= -90 &&
      lat <= 90
    );
  },

  isValidVehicleType: (type) => {
    return ["Car", "Bike"].includes(type);
  },

  isPositiveNumber: (num) => {
    return typeof num === "number" && num > 0;
  },

  isValidDate: (date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed > new Date();
  },
};

// Validation middleware factory
const validate = (validations) => {
  return (req, res, next) => {
    const errors = [];

    for (const validation of validations) {
      const { field, validator, message, location = "body" } = validation;
      const value = req[location]?.[field];

      if (!validator(value)) {
        errors.push({ field, message });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};

// Pre-built validation chains
const validateUser = validate([
  {
    field: "email",
    validator: validators.isEmail,
    message: "Valid email is required",
  },
  {
    field: "firstName",
    validator: validators.isNotEmpty,
    message: "First name is required",
  },
  {
    field: "phNum",
    validator: validators.isPhoneNumber,
    message: "Valid phone number is required (7-15 digits)",
  },
]);

const validateRide = validate([
  {
    field: "typeOfVeh",
    validator: validators.isValidVehicleType,
    message: "Vehicle type must be Car or Bike",
  },
  {
    field: "nuSeats",
    validator: validators.isPositiveNumber,
    message: "Number of seats must be positive",
  },
]);

const validateId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!validators.isObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
      });
    }
    next();
  };
};

module.exports = {
  validators,
  validate,
  validateUser,
  validateRide,
  validateId,
};
