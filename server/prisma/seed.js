const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Admin user ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tunguska.co.za" },
    update: {},
    create: {
      email: "admin@tunguska.co.za",
      passwordHash: adminPassword,
      firstName: "System",
      lastName: "Admin",
      role: "ADMIN",
    },
  });
  console.log(`  Admin user: ${admin.email}`);

  // ── Test user ──────────────────────────────────────────────
  const userPassword = await bcrypt.hash("user123", 12);
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      passwordHash: userPassword,
      firstName: "Sipho",
      lastName: "Ndlovu",
      phone: "0612345678",
      role: "USER",
    },
  });
  console.log(`  Test user: ${testUser.email}`);

  // ── Venue categories ──────────────────────────────────────
  const halls = await prisma.venueCategory.upsert({
    where: { slug: "halls" },
    update: {},
    create: {
      name: "Halls",
      slug: "halls",
      description: "Community halls and function venues for events and gatherings.",
      icon: "building",
      sortOrder: 1,
    },
  });

  const sports = await prisma.venueCategory.upsert({
    where: { slug: "sports" },
    update: {},
    create: {
      name: "Sports",
      slug: "sports",
      description: "Sports fields, courts, and facilities for recreational and competitive use.",
      icon: "trophy",
      sortOrder: 2,
    },
  });

  const parks = await prisma.venueCategory.upsert({
    where: { slug: "parks" },
    update: {},
    create: {
      name: "Parks",
      slug: "parks",
      description: "Public parks and open spaces for events and functions.",
      icon: "tree",
      sortOrder: 3,
    },
  });

  const pools = await prisma.venueCategory.upsert({
    where: { slug: "swimming-pools" },
    update: {},
    create: {
      name: "Swimming Pools",
      slug: "swimming-pools",
      description: "Municipal swimming pools for events and private bookings.",
      icon: "swim",
      sortOrder: 4,
    },
  });

  console.log("  Categories created: Halls, Sports, Parks, Swimming Pools");

  // ── Sport types ────────────────────────────────────────────
  const sportTypes = [
    { name: "Soccer", slug: "soccer", icon: "soccer-field", sortOrder: 1 },
    { name: "Hockey", slug: "hockey", icon: "hockey", sortOrder: 2 },
    { name: "Tennis", slug: "tennis", icon: "tennis", sortOrder: 3 },
    { name: "Cricket", slug: "cricket", icon: "cricket", sortOrder: 4 },
    { name: "Rugby", slug: "rugby", icon: "rugby", sortOrder: 5 },
    { name: "Netball", slug: "netball", icon: "netball", sortOrder: 6 },
    { name: "Athletics", slug: "athletics", icon: "running", sortOrder: 7 },
    { name: "Swimming", slug: "swimming", icon: "swim", sortOrder: 8 },
  ];

  for (const st of sportTypes) {
    await prisma.sportType.upsert({
      where: { slug: st.slug },
      update: {},
      create: { ...st, categoryId: sports.id },
    });
  }
  console.log(`  Sport types created: ${sportTypes.map((s) => s.name).join(", ")}`);

  // ── Sample venues ─────────────────────────────────────────
  const defaultHours = [
    { dayOfWeek: "MONDAY", openTime: "08:00", closeTime: "22:00" },
    { dayOfWeek: "TUESDAY", openTime: "08:00", closeTime: "22:00" },
    { dayOfWeek: "WEDNESDAY", openTime: "08:00", closeTime: "22:00" },
    { dayOfWeek: "THURSDAY", openTime: "08:00", closeTime: "22:00" },
    { dayOfWeek: "FRIDAY", openTime: "08:00", closeTime: "22:00" },
    { dayOfWeek: "SATURDAY", openTime: "08:00", closeTime: "18:00" },
    { dayOfWeek: "SUNDAY", openTime: "08:00", closeTime: "14:00", isClosed: false },
  ];

  const soccerType = await prisma.sportType.findUnique({ where: { slug: "soccer" } });
  const hockeyType = await prisma.sportType.findUnique({ where: { slug: "hockey" } });

  // Hall venue
  await prisma.venue.upsert({
    where: { slug: "kwamashu-community-hall" },
    update: {},
    create: {
      name: "KwaMashu Community Hall",
      slug: "kwamashu-community-hall",
      description: "A spacious community hall ideal for weddings, functions, and community meetings. Equipped with a stage, kitchen, and ample parking.",
      address: "123 Main Road, KwaMashu",
      suburb: "KwaMashu",
      city: "Durban",
      latitude: -29.7450,
      longitude: 30.9730,
      capacity: 300,
      pricePerHour: 250.00,
      amenities: ["parking", "kitchen", "stage", "sound-system", "tables-chairs"],
      rules: "No alcohol without prior approval. Venue must be cleaned after use.",
      categoryId: halls.id,
      operatingHours: { createMany: { data: defaultHours } },
    },
  });

  // Soccer venue
  await prisma.venue.upsert({
    where: { slug: "umlazi-soccer-fields" },
    update: {},
    create: {
      name: "Umlazi Soccer Fields",
      slug: "umlazi-soccer-fields",
      description: "Well-maintained soccer fields with floodlights for evening matches. Suitable for league games and training sessions.",
      address: "456 Sports Drive, Umlazi",
      suburb: "Umlazi",
      city: "Durban",
      latitude: -29.9680,
      longitude: 30.8900,
      capacity: 100,
      pricePerHour: 180.00,
      amenities: ["parking", "floodlights", "changing-rooms", "spectator-seating"],
      categoryId: sports.id,
      sportTypeId: soccerType.id,
      operatingHours: { createMany: { data: defaultHours } },
    },
  });

  // Hockey venue
  await prisma.venue.upsert({
    where: { slug: "northwood-hockey-astro" },
    update: {},
    create: {
      name: "Northwood Hockey Astroturf",
      slug: "northwood-hockey-astro",
      description: "Premium astroturf hockey facility. FIH-approved surface suitable for competitive matches and training.",
      address: "789 Northwood Lane, Durban North",
      suburb: "Durban North",
      city: "Durban",
      latitude: -29.7900,
      longitude: 31.0250,
      capacity: 60,
      pricePerHour: 350.00,
      amenities: ["parking", "floodlights", "changing-rooms", "clubhouse"],
      categoryId: sports.id,
      sportTypeId: hockeyType.id,
      operatingHours: { createMany: { data: defaultHours } },
    },
  });

  console.log("  Sample venues created");
  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
