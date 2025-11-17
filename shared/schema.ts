import { z } from "zod";

export const registerUserSchema = z.object({
  username: z.string().min(3, "Имя пользователя должно содержать минимум 3 символа"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export type User = z.infer<typeof userSchema>;

export type MotorCount = 1 | 2;
export type SensorType = "none" | "line" | "ultrasonic";
export type MicrocontrollerType = "arduino" | "lego";

export const robotConfigSchema = z.object({
  motors: z.union([z.literal(1), z.literal(2)]),
  sensor: z.enum(["none", "line", "ultrasonic"]),
  microcontroller: z.enum(["arduino", "lego"]),
});

export type RobotConfig = z.infer<typeof robotConfigSchema>;

export const programCommandSchema = z.object({
  speed: z.number().min(1).max(10),
  direction: z.number().min(0).max(359),
  duration: z.number().min(1000).max(30000),
});

export type ProgramCommand = z.infer<typeof programCommandSchema>;

export type LevelId = 1 | 2 | 3;

export const levelSchema = z.object({
  id: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  title: z.string(),
  description: z.string(),
  objective: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  unlocked: z.boolean(),
  completed: z.boolean(),
  pointsReward: z.number(),
});

export type Level = z.infer<typeof levelSchema>;

export const userProgressSchema = z.object({
  userId: z.string(),
  currentLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  points: z.number(),
  completedLevels: z.array(z.union([z.literal(1), z.literal(2), z.literal(3)])),
  robotConfig: robotConfigSchema.optional(),
  lastCommand: programCommandSchema.optional(),
});

export type UserProgress = z.infer<typeof userProgressSchema>;
