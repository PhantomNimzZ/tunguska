# Project Tunguska

**eThekwini Municipal Venue Booking System**

A web-based booking platform enabling residents to browse and book municipal venues — community halls, sports fields, parks, and swimming pools — managed by the eThekwini municipality.

## Tech Stack

- **Frontend:** React 19 + Vite
- **Backend:** Express.js + Node.js
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (access + refresh tokens)

## Project Structure

```
tunguska/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/            # Axios client with JWT interceptors
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context provider
│   │   ├── pages/          # Route pages
│   │   └── styles/         # Global CSS
│   └── vite.config.js
├── server/                 # Express API
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Seed data
│   └── src/
│       ├── config/         # DB client
│       ├── controllers/    # Route handlers
│       ├── middleware/      # Auth middleware
│       └── routes/         # API routes
└── package.json            # Root scripts
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+

### Setup

```bash
# 1. Install dependencies
npm run install:all

# 2. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your database credentials

# 3. Run database migrations
npm run db:migrate

# 4. Seed the database
npm run db:seed

# 5. Start development servers
npm run dev
```

The client runs on `http://localhost:5173` and the API on `http://localhost:5000`.

### Seed Accounts

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@tunguska.co.za   | admin123  |
| User  | test@example.com       | user123   |

## API Routes

### Public
- `GET /api/categories` — List venue categories
- `GET /api/venues` — List venues (filter by category/sport)
- `GET /api/venues/:slug` — Venue details
- `GET /api/venues/:slug/availability?date=` — Check availability

### Authenticated (User)
- `POST /api/auth/register` / `POST /api/auth/login`
- `GET /api/bookings` — My bookings
- `POST /api/bookings` — Create booking
- `PATCH /api/bookings/:id/cancel` — Cancel booking

### Admin Only
- `GET /api/admin/stats` — Dashboard statistics
- `GET /api/admin/users` — List users
- `GET /api/admin/bookings` — All bookings
- `PATCH /api/admin/bookings/:id/approve` — Approve booking
- `PATCH /api/admin/bookings/:id/decline` — Decline booking
- `POST /api/admin/venues` — Create venue
