const prisma = require("../config/db");

// GET /api/venues
const getVenues = async (req, res, next) => {
  try {
    const { categorySlug, sportSlug, search } = req.query;

    const where = { isActive: true };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (sportSlug) {
      where.sportType = { slug: sportSlug };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { suburb: { contains: search, mode: "insensitive" } },
      ];
    }

    const venues = await prisma.venue.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        sportType: { select: { id: true, name: true, slug: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: venues });
  } catch (error) {
    next(error);
  }
};

// GET /api/venues/:slug
const getVenueBySlug = async (req, res, next) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        sportType: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" } },
        operatingHours: { orderBy: { dayOfWeek: "asc" } },
      },
    });

    if (!venue || !venue.isActive) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    res.json({ success: true, data: venue });
  } catch (error) {
    next(error);
  }
};

// GET /api/venues/:slug/availability?date=2026-07-15
const getVenueAvailability = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date query parameter is required.",
      });
    }

    const venue = await prisma.venue.findUnique({
      where: { slug },
      include: {
        operatingHours: true,
      },
    });

    if (!venue || !venue.isActive) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    // Get the day of week for the requested date
    const requestedDate = new Date(date);
    const days = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const dayOfWeek = days[requestedDate.getDay()];

    const operatingHour = venue.operatingHours.find(
      (oh) => oh.dayOfWeek === dayOfWeek
    );

    if (!operatingHour || operatingHour.isClosed) {
      return res.json({
        success: true,
        data: { date, isClosed: true, slots: [] },
      });
    }

    // Get existing bookings for this date (approved and pending)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        venueId: venue.id,
        bookingDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ["PENDING", "APPROVED"] },
      },
      select: { startTime: true, endTime: true, status: true },
    });

    res.json({
      success: true,
      data: {
        date,
        dayOfWeek,
        isClosed: false,
        openTime: operatingHour.openTime,
        closeTime: operatingHour.closeTime,
        bookedSlots: existingBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVenues, getVenueBySlug, getVenueAvailability };
