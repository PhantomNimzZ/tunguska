const prisma = require("../config/db");

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.venueCategory.findMany({
      where: { isActive: true },
      include: {
        sportTypes: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, slug: true, icon: true },
        },
        _count: { select: { venues: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:slug
const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await prisma.venueCategory.findUnique({
      where: { slug: req.params.slug },
      include: {
        sportTypes: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!category || !category.isActive) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:slug/sport-types
const getSportTypesByCategory = async (req, res, next) => {
  try {
    const category = await prisma.venueCategory.findUnique({
      where: { slug: req.params.slug },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const sportTypes = await prisma.sportType.findMany({
      where: { categoryId: category.id, isActive: true },
      include: {
        _count: { select: { venues: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    res.json({ success: true, data: sportTypes });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, getCategoryBySlug, getSportTypesByCategory };
