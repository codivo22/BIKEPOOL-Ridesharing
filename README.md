# BikePool - Smart Bike Pooling & Ride-Sharing System

> Share the Ride, Share the Cost.

BikePool connects bike owners travelling on a route with passengers looking for an affordable shared ride. It is a B.Tech final-year full-stack project built with the technology stack specified in its proposal.

## Technology stack

- **Frontend:** React, Vite, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Maps:** Leaflet and OpenStreetMap

## Project structure

```text
client/   React user interface
server/   Express REST API
docs/     Project documentation, diagrams and screenshots
```

## Features

- JWT-based registration, login, logout, protected routes, and user profiles
- Bike management and ride publishing with source/destination coordinates
- Route/date ride search, ride details, and OpenStreetMap route previews
- Passenger booking requests with pickup notes and rider accept/reject decisions
- Seat availability protection, cancellations, upcoming rides, and ride history
- In-app notifications for booking and ride events
- Ratings/reviews after ride completion and user-report APIs
- Admin dashboard for platform statistics, reports, reviews, and account moderation
- Responsive interface designed for desktop and mobile demonstration

## Local setup

1. Install [Node.js LTS](https://nodejs.org/).
2. Create a free MongoDB Atlas cluster, then copy its connection string.
3. Copy `server/.env.example` to `server/.env` and add your values.
4. Run `npm install` in both `client` and `server`.
5. In two terminals, run `npm run dev` in `server`, then `npm run dev` in `client`.

The frontend runs on `http://localhost:5173` and the API runs on `http://localhost:5000`.

### Run the demo

After adding your MongoDB connection string to `server/.env`, open two VS Code terminals:

```bash
cd server
npm run seed
npm run dev
```

```bash
cd client
npm run dev
```

Seeded accounts:

| Account | Email | Password |
| --- | --- | --- |
| Administrator | `admin@bikepool.demo` | `Admin@123` |
| Ride owner | `aarav@bikepool.demo` | `Demo@123` |
| Passenger | `riya@bikepool.demo` | `Demo@123` |

### Suggested demo story

1. Sign in as **Aarav**, open Profile, and show his bike.
2. Show the sample ride in **Find rides**.
3. Sign out and sign in as **Riya** to request its available seat.
4. Sign in as **Aarav** again and accept the request in Dashboard.
5. Demonstrate the notification and booking status update.
6. Sign in as **Admin** to demonstrate user, report, and review moderation.

## API modules

| Module | Base endpoint |
| --- | --- |
| Authentication and profiles | `/api/auth` |
| Bikes | `/api/bikes` |
| Rides | `/api/rides` |
| Bookings | `/api/bookings` |
| Reviews | `/api/reviews` |
| Notifications | `/api/notifications` |
| Reports | `/api/reports` |
| Admin | `/api/admin` |

## Safety note

BikePool is a student project prototype. It does not process payments, verify legal eligibility, or provide emergency services. Users should follow all local road-safety, helmet, insurance, and passenger rules.
