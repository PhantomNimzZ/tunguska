const bcrypt = require("bcryptjs");
const prisma = require("../config/db");

// ── USERS ────────────────────────────────────────────────────

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) where.role = role.toUpperCase();

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { firstName, lastName, phone, role, isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ── VENUES ───────────────────────────────────────────────────

// GET /api/admin/venues
const getAllVenues = async (req, res, next) => {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        sportType: { select: { id: true, name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { bookings: true } },
      },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: venues });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/venues
const createVenue = async (req, res, next) => {
  try {
    const {
      name, slug, description, address, suburb, latitude, longitude,
      capacity, pricePerHour, amenities, rules, categoryId, sportTypeId,
      operatingHours,
    } = req.body;

    const venue = await prisma.venue.create({
      data: {
        name, slug, description, address, suburb, latitude, longitude,
        capacity, pricePerHour, amenities: amenities || [], rules,
        categoryId, sportTypeId,
        operatingHours: operatingHours
          ? { createMany: { data: operatingHours } }
          : undefined,
      },
      include: {
        category: true,
        sportType: true,
        operatingHours: true,
      },
    });

    res.status(201).json({ success: true, data: venue });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/venues/:id
const updateVenue = async (req, res, next) => {
  try {
    const {
      name, slug, description, address, suburb, latitude, longitude,
      capacity, pricePerHour, amenities, rules, categoryId, sportTypeId,
      isActive, operatingHours,
    } = req.body;

    // Update venue fields
    const venue = await prisma.venue.update({
      where: { id: req.params.id },
      data: {
        name, slug, description, address, suburb, latitude, longitude,
        capacity, pricePerHour, amenities, rules, categoryId, sportTypeId,
        isActive,
      },
      include: { category: true, sportType: true },
    });

    // Update operating hours if provided
    if (operatingHours && Array.isArray(operatingHours)) {
      await prisma.operatingHours.deleteMany({ where: { venueId: venue.id } });
      await prisma.operatingHours.createMany({
        data: operatingHours.map((h) => ({
          venueId: venue.id,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed || false,
        })),
      });
    }

    // Refetch with operating hours included
    const updated = await prisma.venue.findUnique({
      where: { id: venue.id },
      include: { category: true, sportType: true, operatingHours: true },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/venues/:id (soft delete)
const deleteVenue = async (req, res, next) => {
  try {
    await prisma.venue.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ success: true, message: "Venue deactivated." });
  } catch (error) {
    next(error);
  }
};

// ── BOOKINGS ─────────────────────────────────────────────────

// GET /api/admin/bookings
const getAllBookings = async (req, res, next) => {
  try {
    const { status, venueId } = req.query;
    const where = {};

    if (status) where.status = status.toUpperCase();
    if (venueId) where.venueId = venueId;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        venue: { select: { id: true, name: true, slug: true, address: true, suburb: true, pricePerHour: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/bookings
const createBookingAsAdmin = async (req, res, next) => {
  try {
    const { userId, venueId, bookingDate, startTime, endTime, purpose, notes, status } = req.body;

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: { operatingHours: true },
    });
    if (!venue) {
      return res.status(404).json({ success: false, message: "Venue not found." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ success: false, message: "End time must be after start time." });
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
        status: status || "APPROVED",
        userId,
        venueId,
        payment: {
          create: {
            amount: totalAmount,
            status: "UNPAID",
          },
        },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        venue: { select: { name: true } },
        payment: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Booking created.",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/bookings/:id/approve
const approveBooking = async (req, res, next) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: "APPROVED" },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        venue: { select: { name: true } },
      },
    });

    res.json({
      success: true,
      message: "Booking approved.",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/bookings/:id/decline
const declineBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: "DECLINED", declineReason: reason },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        venue: { select: { name: true } },
      },
    });

    res.json({
      success: true,
      message: "Booking declined.",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/bookings/:id/payment
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, method, reference } = req.body;

    const payment = await prisma.payment.update({
      where: { bookingId: req.params.id },
      data: {
        status: status.toUpperCase(),
        method,
        reference,
        paidAt: status.toUpperCase() === "PAID" ? new Date() : null,
      },
    });

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// ── CATEGORIES ───────────────────────────────────────────────

// POST /api/admin/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon, sortOrder } = req.body;
    const category = await prisma.venueCategory.create({
      data: { name, slug, description, icon, sortOrder },
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon, sortOrder, isActive } = req.body;
    const category = await prisma.venueCategory.update({
      where: { id: req.params.id },
      data: { name, slug, description, icon, sortOrder, isActive },
    });
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/sport-types
const createSportType = async (req, res, next) => {
  try {
    const { name, slug, description, icon, sortOrder, categoryId } = req.body;
    const sportType = await prisma.sportType.create({
      data: { name, slug, description, icon, sortOrder, categoryId },
    });
    res.status(201).json({ success: true, data: sportType });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/sport-types/:id
const updateSportType = async (req, res, next) => {
  try {
    const { name, slug, description, icon, sortOrder, isActive } = req.body;
    const sportType = await prisma.sportType.update({
      where: { id: req.params.id },
      data: { name, slug, description, icon, sortOrder, isActive },
    });
    res.json({ success: true, data: sportType });
  } catch (error) {
    next(error);
  }
};

// ── VENUE IMAGES ─────────────────────────────────────────────

// POST /api/admin/venues/:id/images
const uploadVenueImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const venue = await prisma.venue.findUnique({ where: { id: req.params.id } });
    if (!venue) {
      return res.status(404).json({ success: false, message: "Venue not found." });
    }

    const existingCount = await prisma.venueImage.count({ where: { venueId: venue.id } });

    const image = await prisma.venueImage.create({
      data: {
        url: `/uploads/${req.file.filename}`,
        altText: venue.name,
        sortOrder: existingCount,
        isPrimary: existingCount === 0,
        venueId: venue.id,
      },
    });

    res.status(201).json({ success: true, data: image });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/venues/:id/images
const getVenueImages = async (req, res, next) => {
  try {
    const images = await prisma.venueImage.findMany({
      where: { venueId: req.params.id },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ success: true, data: images });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/venues/:venueId/images/:imageId/primary
const setImagePrimary = async (req, res, next) => {
  try {
    const { venueId, imageId } = req.params;

    await prisma.venueImage.updateMany({
      where: { venueId },
      data: { isPrimary: false },
    });

    const image = await prisma.venueImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });

    res.json({ success: true, data: image });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/venues/:venueId/images/:imageId
const deleteVenueImage = async (req, res, next) => {
  try {
    await prisma.venueImage.delete({ where: { id: req.params.imageId } });
    res.json({ success: true, message: "Image deleted." });
  } catch (error) {
    next(error);
  }
};

// ── DASHBOARD STATS ──────────────────────────────────────────

// GET /api/admin/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalVenues, totalBookings, pendingBookings, revenue] =
      await Promise.all([
        prisma.user.count({ where: { role: "USER" } }),
        prisma.venue.count({ where: { isActive: true } }),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: "PENDING" } }),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: "PAID" },
        }),
      ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalVenues,
        totalBookings,
        pendingBookings,
        totalRevenue: revenue._sum.amount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers, updateUser,
  getAllVenues, createVenue, updateVenue, deleteVenue,
  getAllBookings, createBookingAsAdmin, approveBooking, declineBooking, updatePaymentStatus,
  createCategory, updateCategory, createSportType, updateSportType,
  uploadVenueImage, getVenueImages, setImagePrimary, deleteVenueImage,
  getDashboardStats,
};
