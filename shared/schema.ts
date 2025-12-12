import { z } from "zod";

export const registerUserSchema = z.object({
  username: z.string().min(3, "Имя пользователя должно содержать минимум 3 символа"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Пароль обязателен"),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  createdAt: z.string().optional(),
  lastLogin: z.string().optional(),
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

// Схема для прогресса по дисциплине
export const disciplineProgressSchema = z.object({
  completed: z.number().int().min(0),
  points: z.number().int().min(0),
  lastCompletedAt: z.string().optional(),
});

export type DisciplineProgress = z.infer<typeof disciplineProgressSchema>;

// Схема для достижений
export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  unlocked: z.boolean(),
  unlockedAt: z.string().optional(),
  pointsReward: z.number().optional(),
});

export type Achievement = z.infer<typeof achievementSchema>;

// Расширенная схема для прогресса пользователя
export const userProgressSchema = z.object({
  userId: z.string(),
  currentLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  points: z.number().int().min(0),
  totalPoints: z.number().int().min(0).optional(),
  completedLevels: z.array(z.union([z.literal(1), z.literal(2), z.literal(3)])),
  
  // Прогресс по дисциплинам
  math: disciplineProgressSchema.optional(),
  physics: disciplineProgressSchema.optional(),
  coding: disciplineProgressSchema.optional(),
  
  // Статистика
  streak: z.number().int().min(0).optional(),
  lastActive: z.string().optional(),
  totalTasksCompleted: z.number().int().min(0).optional(),
  completionRate: z.number().min(0).max(100).optional(),
  
  // Достижения
  achievements: z.array(achievementSchema).optional(),
  
  // Робототехника
  robotConfig: robotConfigSchema.optional(),
  lastCommand: programCommandSchema.optional(),
  
  // Метаданные
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type UserProgress = z.infer<typeof userProgressSchema>;

// Схема для статистики пользователя
export const userStatsSchema = z.object({
  totalPoints: z.number().int().min(0),
  completedTasks: z.number().int().min(0),
  totalTasks: z.number().int().min(0),
  completionRate: z.number().min(0).max(100),
  level: z.number().int().min(1),
  streak: z.number().int().min(0),
  lastActive: z.string(),
  rank: z.string().optional(),
  achievementsUnlocked: z.number().int().min(0).optional(),
  totalAchievements: z.number().int().min(0).optional(),
});

export type UserStats = z.infer<typeof userStatsSchema>;

// Схема для задачи
export const taskSchema = z.object({
  id: z.number().int().positive(),
  discipline: z.enum(["math", "physics", "coding"]),
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  points: z.number().int().min(0),
  completed: z.boolean().default(false),
  completedAt: z.string().optional(),
  solution: z.string().optional(),
  hints: z.array(z.string()).optional(),
});

export type Task = z.infer<typeof taskSchema>;

// Схема для дисциплины
export const disciplineSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  color: z.string(),
  gradient: z.string(),
  totalTasks: z.number().int().min(0),
  completedTasks: z.number().int().min(0),
  points: z.number().int().min(0),
  progress: z.number().min(0).max(100),
});

export type Discipline = z.infer<typeof disciplineSchema>;

// Схема для уровня пользователя
export const userLevelSchema = z.object({
  level: z.number().int().min(1),
  currentPoints: z.number().int().min(0),
  pointsToNextLevel: z.number().int().min(1),
  progressPercentage: z.number().min(0).max(100),
  title: z.string(),
  description: z.string(),
});

export type UserLevel = z.infer<typeof userLevelSchema>;

// Схема для активности пользователя
export const activitySchema = z.object({
  id: z.string(),
  type: z.enum(["task_completed", "level_completed", "achievement_unlocked", "login"]),
  title: z.string(),
  description: z.string(),
  points: z.number().int().optional(),
  timestamp: z.string(),
  discipline: z.enum(["math", "physics", "coding"]).optional(),
  icon: z.string().optional(),
});

export type Activity = z.infer<typeof activitySchema>;

// Схема для обновления профиля
export const updateProfileSchema = z.object({
  username: z.string().min(3, "Имя пользователя должно содержать минимум 3 символа").optional(),
  avatar: z.string().url("Некорректный URL аватара").optional(),
  bio: z.string().max(200, "Биография не должна превышать 200 символов").optional(),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

// Схема для смены пароля
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Текущий пароль обязателен"),
  newPassword: z.string().min(6, "Новый пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string().min(6, "Подтверждение пароля обязательно"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export type ChangePassword = z.infer<typeof changePasswordSchema>;

// Константы для дисциплин
export const DISCIPLINE_CONSTANTS = {
  MATH: {
    TOTAL_TASKS: 20,
    MAX_POINTS: 650,
  },
  PHYSICS: {
    TOTAL_TASKS: 15,
    MAX_POINTS: 300,
  },
  CODING: {
    TOTAL_TASKS: 5,
    MAX_POINTS: 120,
  },
  TOTAL_TASKS: 40, // 20 + 15 + 5
  TOTAL_MAX_POINTS: 1070, // 650 + 300 + 120
} as const;

// Константы для уровней
export const LEVEL_CONSTANTS = {
  POINTS_PER_LEVEL: 100,
  MAX_LEVEL: 50,
  LEVEL_TITLES: {
    1: "Новичок",
    5: "Ученик",
    10: "Исследователь",
    15: "Специалист",
    20: "Эксперт",
    25: "Мастер",
    30: "Гуру",
    40: "Легенда",
    50: "Вершина"
  } as Record<number, string>
} as const;

// Типы для достижений (предопределенные)
export const ACHIEVEMENT_TYPES = {
  FIRST_STEPS: {
    id: "first_steps",
    title: "Первые шаги",
    description: "Выполните первую задачу",
    icon: "Target",
    pointsReward: 10,
  },
  MATH_MASTER: {
    id: "math_master", 
    title: "Мастер математики",
    description: "Завершите все задачи по математике",
    icon: "Calculator",
    pointsReward: 50,
  },
  PHYSICS_WIZARD: {
    id: "physics_wizard",
    title: "Волшебник физики", 
    description: "Завершите все задачи по физике",
    icon: "Atom",
    pointsReward: 50,
  },
  CODE_NINJA: {
    id: "code_ninja",
    title: "Ниндзя кода",
    description: "Завершите все задачи по программированию",
    icon: "Bot",
    pointsReward: 50,
  },
  WEEK_STREAK: {
    id: "week_streak",
    title: "Неделя прогресса",
    description: "Занимайтесь 7 дней подряд",
    icon: "TrendingUp",
    pointsReward: 30,
  },
  POINT_MASTER: {
    id: "point_master",
    title: "Мастер баллов",
    description: "Наберите 500 баллов",
    icon: "Trophy",
    pointsReward: 25,
  },
  SPEED_LEARNER: {
    id: "speed_learner",
    title: "Скоростное обучение",
    description: "Завершите 3 задачи за один день",
    icon: "Zap",
    pointsReward: 20,
  },
  COMPLETE_COURSE: {
    id: "complete_course",
    title: "Завершение курса",
    description: "Завершите все дисциплины",
    icon: "Award",
    pointsReward: 100,
  },
} as const;

// Тип для всех достижений
export type AchievementType = typeof ACHIEVEMENT_TYPES[keyof typeof ACHIEVEMENT_TYPES];