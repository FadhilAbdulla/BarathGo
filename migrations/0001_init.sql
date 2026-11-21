-- BarathGo core schema (Cloudflare D1 / SQLite). Times are unix epoch milliseconds.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

CREATE TABLE otps (
  phone TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE drivers (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  vehicle_type TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  licence_number TEXT NOT NULL,
  city TEXT NOT NULL,
  approved INTEGER NOT NULL DEFAULT 0,
  online INTEGER NOT NULL DEFAULT 0,
  lat REAL,
  lng REAL,
  location_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX drivers_online ON drivers(online, vehicle_type);

CREATE TABLE rides (
  id TEXT PRIMARY KEY,
  rider_id TEXT NOT NULL REFERENCES users(id),
  driver_id TEXT REFERENCES users(id),
  status TEXT NOT NULL,
  ride_type TEXT NOT NULL,
  pickup_label TEXT NOT NULL,
  pickup_lat REAL NOT NULL,
  pickup_lng REAL NOT NULL,
  drop_label TEXT NOT NULL,
  drop_lat REAL NOT NULL,
  drop_lng REAL NOT NULL,
  distance_m INTEGER NOT NULL,
  duration_s INTEGER NOT NULL,
  fare INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  pin TEXT NOT NULL,
  rating INTEGER,
  cancelled_by TEXT,
  created_at INTEGER NOT NULL,
  accepted_at INTEGER,
  arrived_at INTEGER,
  started_at INTEGER,
  completed_at INTEGER,
  cancelled_at INTEGER
);
CREATE INDEX rides_status ON rides(status, ride_type);
CREATE INDEX rides_rider ON rides(rider_id, created_at);
CREATE INDEX rides_driver ON rides(driver_id, created_at);

-- Drivers who declined a request don't see it again.
CREATE TABLE ride_declines (
  ride_id TEXT NOT NULL,
  driver_id TEXT NOT NULL,
  PRIMARY KEY (ride_id, driver_id)
);
