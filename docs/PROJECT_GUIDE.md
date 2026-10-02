# BikePool Project Guide

## Viva explanation in one minute

BikePool is a full-stack ride-sharing platform for short-distance two-wheeler commuting. A bike owner publishes a ride with a route, time, and contribution. A passenger searches for that route and sends a booking request. The owner accepts or rejects it; accepting safely reduces the available seat count. After completing the ride, both users can review each other. An administrator can moderate users, reports, and reviews.

## Core data flow

```text
React UI -> Express REST API -> MongoDB
    |             |
    |             +-> JWT authentication and role checks
    |
    +-> Leaflet/OpenStreetMap route display
```

## Main collections

- `users`: account, profile, role, rating, account status
- `bikes`: bike model and registration details owned by a user
- `rides`: owner, bike, route, time, contribution, seats, and status
- `bookings`: passenger request and its lifecycle status
- `reviews`: completed-ride rating and comment
- `notifications`: booking and ride updates
- `reports`: safety and moderation complaints

## Status flow

```text
Booking: pending -> accepted / rejected / cancelled -> completed
Ride:    published -> full -> completed / cancelled
```

## Important security choices

- Passwords are hashed with bcrypt before storing them.
- JWT protects member-only APIs.
- Admin APIs require a separate `admin` role.
- Users cannot book their own ride.
- One passenger cannot request the same ride twice.
- A booking can only be accepted while the ride has seats available.
