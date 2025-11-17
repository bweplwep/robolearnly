import { 
  userSchema, 
  userProgressSchema, 
  robotConfigSchema, 
  programCommandSchema,
  type User, 
  type UserProgress, 
  type RobotConfig, 
  type ProgramCommand, 
  type LevelId 
} from "@shared/schema";

const STORAGE_KEYS = {
  USER: "roboquest_user",
  PROGRESS: "roboquest_progress",
} as const;

export const storageService = {
  saveUser(user: User): void {
    const validated = userSchema.parse(user);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(validated));
  },

  getUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return userSchema.parse(parsed);
    } catch (error) {
      console.error("Invalid user data in localStorage:", error);
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  },

  clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
  },

  saveProgress(progress: UserProgress): void {
    const validated = userProgressSchema.parse(progress);
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(validated));
  },

  getProgress(): UserProgress | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return userProgressSchema.parse(parsed);
    } catch (error) {
      console.error("Invalid progress data in localStorage:", error);
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      return null;
    }
  },

  initializeProgress(userId: string): UserProgress {
    const progress: UserProgress = {
      userId,
      currentLevel: 1,
      points: 0,
      completedLevels: [],
    };
    this.saveProgress(progress);
    return progress;
  },

  updateRobotConfig(config: RobotConfig): void {
    const validated = robotConfigSchema.parse(config);
    const progress = this.getProgress();
    if (progress) {
      progress.robotConfig = validated;
      this.saveProgress(progress);
    }
  },

  updateCommand(command: ProgramCommand): void {
    const validated = programCommandSchema.parse(command);
    const progress = this.getProgress();
    if (progress) {
      progress.lastCommand = validated;
      this.saveProgress(progress);
    }
  },

  completeLevel(levelId: LevelId, points: number): void {
    const progress = this.getProgress();
    if (progress) {
      if (!progress.completedLevels.includes(levelId)) {
        progress.completedLevels.push(levelId);
        progress.points += points;
        if (levelId === 3) {
          progress.currentLevel = 3;
        } else {
          progress.currentLevel = (levelId + 1) as LevelId;
        }
        this.saveProgress(progress);
      }
    }
  },
};
