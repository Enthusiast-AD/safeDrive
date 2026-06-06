# SafeDrive – Driver Distraction & Harsh Driving Detection

SafeDrive is a React Native (Expo) mobile app that uses device sensors to analyze driving behavior in real time, detect unsafe events, and calculate a driving safety score.

## Project Overview

During an active drive session, SafeDrive collects accelerometer, gyroscope, device motion, and magnetometer data at 100ms intervals. An event detection engine identifies harsh braking, harsh acceleration, sharp turns, aggressive steering, excessive device movement, and possible phone handling. Each event deducts points from a starting score of 100. When the drive ends, a dashboard summarizes duration, events, score, and safety rating.

## Tech Stack

- **React Native** 0.83 + **Expo** 55
- **TypeScript**
- **Expo Router** (file-based navigation)
- **expo-sensors** (Accelerometer, Gyroscope, DeviceMotion, Magnetometer)

## Sensors Used

| Sensor | Purpose |
|--------|---------|
| **Accelerometer** | Detects sudden forward/backward g-force spikes (brake/accel) and excessive movement |
| **Gyroscope** | Detects rotation rate for sharp turns and aggressive steering |
| **Device Motion** | Fused user acceleration and rotation rate (preferred when available) |
| **Magnetometer** | Optional heading-change validation for sharp turns |

## Event Detection Strategy

Detection runs every **100ms** during an active session. Each event type has a **2-second cooldown** to prevent duplicate triggers from a single motion.

### Threshold Values

| Event | Threshold | Logic |
|-------|-----------|-------|
| **Harsh Braking** | 0.45g delta | Dominant accelerometer axis drops ≥ 0.45g between samples |
| **Harsh Acceleration** | 0.45g delta | Dominant accelerometer axis rises ≥ 0.45g between samples |
| **Sharp Turn** | 2.0 rad/s (yaw) | Gyroscope Z rotation rate exceeds threshold |
| **Aggressive Steering** | 1.5 rad/s (roll/pitch) | High roll/pitch rotation for 2+ consecutive samples |
| **Excessive Device Movement** | 0.35g deviation | Total acceleration magnitude deviates from ~1g (gravity) |
| **Phone Handling** | Gyro ≥ 2.5 rad/s + accel variance ≥ 0.25 | Combined rotation spike and accelerometer variance (pickup motion) |
| **Magnetometer Turn** *(optional)* | 45° heading change | Validates sharp heading change when gyro alone may miss |

> **Note:** Accelerometer values are in **g** (1g ≈ 9.81 m/s²). Gyroscope values are in **rad/s**.

## Driving Score Calculation

- **Starting score:** 100
- **Minimum score:** 0

| Event | Penalty |
|-------|---------|
| Harsh Braking | -5 |
| Harsh Acceleration | -5 |
| Sharp Turn | -3 |
| Aggressive Steering | -3 |
| Excessive Device Movement | -4 |
| Phone Handling | -10 |

**Safety Ratings:**

| Score Range | Rating |
|-------------|--------|
| 90–100 | Excellent |
| 75–89 | Good |
| 60–74 | Fair |
| 40–59 | Poor |
| 0–39 | Critical |

## Project Structure

```
src/
├── app/                  # Expo Router screens
│   ├── index.tsx         # Home / Start Drive
│   ├── drive.tsx         # Active driving session
│   └── summary.tsx       # Post-drive dashboard
├── components/           # Reusable UI (ScoreRing, SensorCard, etc.)
├── constants/            # Thresholds, penalties, ratings
├── hooks/                # useDrivingSession (sensor lifecycle)
├── services/             # EventDetector, scoreCalculator
├── screens/              # DriveScreen, DashboardScreen
├── store/                # Session store for summary navigation
├── types/                # TypeScript interfaces
└── utils/                # Math helpers
```

## How to Run Locally

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on a physical device (recommended for real sensor data) or an emulator

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npx expo start

```

