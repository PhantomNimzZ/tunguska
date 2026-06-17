const prisma = require("../config/db");

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { venueId, bookingDate, startTime, endTime, purpose, notes } =
      req.body;

    // Verify venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: { operatingHours: true },
    });
    if (!venue || !venue.isActive) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    // Validate start time is before end time
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time.",
      });
    }

    // Validate booking is not in the past
    const now = new Date();
    const requestedDate = new Date(bookingDate);
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const requestedDateStr = `${requestedDate.getFullYear()}-${String(requestedDate.getMonth() + 1).padStart(2, "0")}-${String(requestedDate.getDate()).padStart(2, "0")}`;

    if (requestedDateStr < todayStr) {
      return res.status(400).json({
        success: false,
        message: "Cannot book a date in the past.",
      });
    }

    // If booking is for today, ensure start time is in the future
    if (requestedDateStr === todayStr) {
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      if (startTime <= currentTime) {
        return res.status(400).json({
          success: false,
          message: `Start time must be after the current time (${currentTime}).`,
        });
      }
    }

    // Validate against operating hours
    const days = [
      "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY",
      "THURSDAY", "FRIDAY", "SATURDAY",
    ];
    const dayOfWeek = days[requestedDate.getDay()];

    const operatingHour = venue.operatingHours.find(
      (oh) => oh.dayOfWeek === dayOfWeek
    );

    if (!operatingHour || operatingHour.isClosed) {
      return res.status(400).json({
        success: false,
        message: `This venue is closed on ${dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase()}s.`,
      });
    }

    if (startTime < operatingHour.openTime || endTime > operatingHour.closeTime) {
      return res.status(400).json({
        success: false,
        message: `Booking must be within operating hours: ${operatingHour.openTime} – ${operatingHour.closeTime}.`,
      });
    }

    // Check for conflicting bookings
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflict = await prisma.booking.findFirst({
      where: {
        venueId,
        bookingDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ["PENDING", "APPROVED"] },
        OR: [
          { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
          { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
          { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
        ],
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked or has a pending request.",
      });
    }

    // Calculate total amount
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const durationHours = endH - startH + (endM - startM) / 60;
    const totalAmount = Math.round(durationHours * venue.pricePerHour * 100) / 100;

    const booking = await prisma.booking.create({
      data: {
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        totalAmount,
        purpose,
        notes,
        userId: req.user.id,
        venueId,
        payment: {
          create: {
            amount: totalAmount,
            status: "UNPAID",
          },
        },
      },
      include: {
        venue: { select: { name: true, address: true, pricePerHour: true } },
        payment: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Booking request submitted. Awaiting admin approval.",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings
const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = { userId: req.user.id };
    if (status) {
      where.status = status.toUpperCase();
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        venue: {
          select: {
            name: true,
            slug: true,
            address: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        payment: { select: { status: true, amount: true } },
      },
      orderBy: { bookingDate: "desc" },
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        venue: {
          select: {
            name: true,
            slug: true,
            address: true,
            suburb: true,
            pricePerHour: true,
            images: true,
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled.",
      });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" },
      include: {
        venue: { select: { name: true } },
      },
    });

    res.json({
      success: true,
      message: "Booking cancelled successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking };
