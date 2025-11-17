# РобоКвест - Виртуальная Лаборатория Робототехники

## Overview
РобоКвест — это образовательная веб-платформа для обучения робототехнике школьников и студентов. Пользователи собирают виртуальных роботов, программируют их и решают задачи в интерактивной среде с физической симуляцией. Платформа использует геймификацию для повышения мотивации.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Wouter (routing)
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Physics Engine**: Matter.js (2D physics simulation)
- **Data Persistence**: localStorage (no backend database needed)
- **Forms**: React Hook Form + Zod validation
- **Backend**: Express.js (minimal - serves static files only)

## Project Structure

### Frontend (`client/src/`)
- **pages/**
  - `landing.tsx` - Landing page with hero, info sections, registration dialog
  - `game.tsx` - Main game interface with robot constructor, simulator, programming interface
  
- **components/**
  - `physics-simulator.tsx` - Matter.js integration for 2D physics simulation
  - `ui/` - Shadcn UI component library

- **lib/**
  - `storage.ts` - localStorage service for user data and progress
  - `levels.ts` - Level definitions and configuration
  - `queryClient.ts` - React Query configuration

### Shared (`shared/`)
- `schema.ts` - TypeScript interfaces and Zod schemas for data validation

## Key Features

### 1. Landing Page
- Hero section with gradient background and call-to-action
- Three information cards explaining the platform
- Registration modal with form validation (username, email, password)
- Responsive design with smooth animations

### 2. Robot Constructor
- Dropdown selectors for:
  - Motors: 1 or 2
  - Sensors: none, line detector, ultrasonic
  - Microcontroller: Arduino or Lego Mindstorms
- Configuration saved to localStorage

### 3. Programming Interface
- Input fields for:
  - Speed (1-10)
  - Direction (0-360 degrees)
  - Duration (milliseconds)
- Commands saved and applied to physics simulation

### 4. Physics Simulator
- 800x400px canvas with Matter.js
- Dark background (#1a1a2e) for better contrast
- Robot rendered as blue/purple rectangle
- Obstacles (red), targets (green), cargo (yellow for level 3)
- Real-time collision detection
- Timer for level 3 (30-second limit)

### 5. Three Challenge Levels

**Level 1: Простой старт (Easy)**
- Objective: Move robot in straight line to green target
- Reward: 10 points

**Level 2: Обход препятствий (Medium)**
- Objective: Navigate around red obstacles to reach target
- Sensor helps avoid collisions
- Reward: 20 points

**Level 3: Доставка груза (Hard)**
- Objective: Deliver yellow cargo to green zone within 30 seconds
- More complex physics with cargo object
- Reward: 30 points

### 6. Gamification
- Progress badges showing level completion status
- Points counter in header
- Levels unlock progressively (must complete previous level)
- Achievement feedback with toast notifications
- All progress saved to localStorage

### 7. Code Export
- Generates Arduino-compatible code based on robot configuration
- Includes motor control, sensor reading, movement logic
- Copy to clipboard functionality

## Data Models

### User
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  password: string;
}
```

### Robot Configuration
```typescript
interface RobotConfig {
  motors: 1 | 2;
  sensor: "none" | "line" | "ultrasonic";
  microcontroller: "arduino" | "lego";
}
```

### Program Command
```typescript
interface ProgramCommand {
  speed: number;
  direction: number;
  duration: number;
}
```

### User Progress
```typescript
interface UserProgress {
  userId: string;
  currentLevel: 1 | 2 | 3;
  points: number;
  completedLevels: number[];
  robotConfig?: RobotConfig;
  lastCommand?: ProgramCommand;
}
```

## Design System

### Colors
- Primary: Blue (#3b82f6) - used for buttons, accents, Arduino robots
- Success: Green (#10b981) - target zones
- Error: Red (#ef4444) - obstacles
- Warning: Yellow (#eab308) - cargo items
- Chart colors for additional accents

### Typography
- Font Family: Inter (sans-serif), Roboto Mono (code)
- Headings: 600-700 weight
- Body: 400 weight, 1rem base size

### Layout
- Consistent spacing with Tailwind scale (2, 4, 6, 8, 12, 16)
- Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- Cards with subtle shadows and rounded corners
- Hover elevate effects on interactive elements

## User Flow

1. **Landing** → User sees hero and info cards
2. **Registration** → User creates account (saved to localStorage)
3. **Game Page** → Automatically redirected after registration
4. **Robot Constructor** → User selects motors, sensors, microcontroller
5. **Programming** → User sets speed, direction, duration
6. **Simulation** → User runs physics simulation to test robot
7. **Feedback** → System provides success/failure messages with tips
8. **Level Completion** → Points awarded, next level unlocked
9. **Code Export** → User can copy Arduino code for real-world application

## localStorage Keys
- `roboquest_user` - Current user data
- `roboquest_progress` - User progress including points, levels, robot config

## Running the Application
```bash
npm run dev
```
Server starts on port 5000 with Vite HMR enabled.

## Recent Changes
- 2025-01-16: Initial implementation of РобоКвест MVP
  - Landing page with Russian language content
  - Game page with all core features
  - Matter.js physics integration
  - Three challenge levels with progressive difficulty
  - localStorage-based persistence
  - Arduino code generation

## Future Enhancements (Post-MVP)
- User profile dashboard with detailed statistics
- More challenge levels with varying physics scenarios
- Visual drag-and-drop robot component builder
- Multiplayer mode to compete with friends
- Leaderboards and social sharing
- Backend with database for cross-device sync
- Advanced sensors and components
- Custom level editor
