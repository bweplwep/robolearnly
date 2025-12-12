import { 
  userSchema, 
  userProgressSchema, 
  robotConfigSchema, 
  programCommandSchema,
  disciplineProgressSchema,
  achievementSchema,
  DISCIPLINE_CONSTANTS,
  LEVEL_CONSTANTS,
  ACHIEVEMENT_TYPES,
  type User, 
  type UserProgress, 
  type RobotConfig, 
  type ProgramCommand, 
  type LevelId,
  type DisciplineProgress,
  type Achievement
} from "@shared/schema";

const STORAGE_KEYS = {
  USERS: "robolearnly_users",
  CURRENT_USER_ID: "robolearnly_current_user_id", // Новый ключ для текущего пользователя
  PROGRESS_PREFIX: "robolearnly_progress_", // Префикс для прогресса
  ACTIVITIES_PREFIX: "robolearnly_activities_", // Префикс для активностей
} as const;

// Предопределенные достижения
const DEFAULT_ACHIEVEMENTS: Achievement[] = Object.values(ACHIEVEMENT_TYPES).map(achievement => ({
  id: achievement.id,
  title: achievement.title,
  description: achievement.description,
  icon: achievement.icon,
  unlocked: false,
  unlockedAt: undefined,
  pointsReward: achievement.pointsReward,
}));

export const storageService = {
  // ============ МЕТОДЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ============
  
  saveUser(user: User): void {
    const validated = userSchema.parse({
      ...user,
      createdAt: user.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
    
    const users = this.getUsers();
    const existingUserIndex = users.findIndex(u => u.email === user.email);
    
    if (existingUserIndex >= 0) {
      // Обновляем существующего пользователя
      users[existingUserIndex] = validated;
    } else {
      // Добавляем нового пользователя
      users.push(validated);
    }
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Получаем текущего пользователя
  getCurrentUser(): User | null {
    try {
      const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (!currentUserId) return null;
      
      const users = this.getUsers();
      return users.find(user => user.id === currentUserId) || null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  // Для совместимости со старым кодом
  getUser(): User | null {
    return this.getCurrentUser();
  },

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      
      if (!Array.isArray(parsed)) {
        // Если это не массив, но есть данные, возвращаем как массив с одним элементом
        const singleUser = userSchema.parse(parsed);
        return [singleUser];
      }
      
      return parsed.map(user => userSchema.parse(user));
    } catch (error) {
      console.error("Invalid users data:", error);
      localStorage.removeItem(STORAGE_KEYS.USERS);
      return [];
    }
  },

  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  },

  setCurrentUser(userId: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    
    // Обновляем время последнего входа
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
      users[userIndex].lastLogin = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  clearCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  },

  clearAllData(): void {
    // Очищаем всех пользователей
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    
    // Очищаем весь прогресс и активности
    this.clearAllProgress();
    this.clearAllActivities();
  },

  clearAllProgress(): void {
    // Удаляем весь прогресс всех пользователей
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEYS.PROGRESS_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  },

  clearAllActivities(): void {
    // Удаляем все активности всех пользователей
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEYS.ACTIVITIES_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  },

  // ============ МЕТОДЫ ДЛЯ ПРОГРЕССА ============
  
  // Сохраняем прогресс для конкретного пользователя
  saveProgress(userId: string, progress: UserProgress): void {
    const validated = userProgressSchema.parse({
      ...progress,
      userId, // Убеждаемся, что userId правильный
      updatedAt: new Date().toISOString(),
    });
    
    const progressKey = `${STORAGE_KEYS.PROGRESS_PREFIX}${userId}`;
    localStorage.setItem(progressKey, JSON.stringify(validated));
  },

  // Получаем прогресс для конкретного пользователя
  getProgressForUser(userId: string): UserProgress | null {
    try {
      const progressKey = `${STORAGE_KEYS.PROGRESS_PREFIX}${userId}`;
      const data = localStorage.getItem(progressKey);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return userProgressSchema.parse(parsed);
    } catch (error) {
      console.error("Invalid progress data:", error);
      return null;
    }
  },

  // Получаем прогресс текущего пользователя (для совместимости)
  getProgress(): UserProgress | null {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    
    return this.getProgressForUser(currentUser.id);
  },

  initializeProgress(userId: string): UserProgress {
    const progress: UserProgress = {
      userId,
      currentLevel: 1,
      points: 0,
      totalPoints: 0,
      completedLevels: [],
      math: { completed: 0, points: 0 },
      physics: { completed: 0, points: 0 },
      coding: { completed: 0, points: 0 },
      streak: 0,
      lastActive: new Date().toISOString(),
      achievements: DEFAULT_ACHIEVEMENTS,
      totalTasksCompleted: 0,
      completionRate: 0,
      createdAt: new Date().toISOString(),
    };
    
    this.saveProgress(userId, progress);
    return progress;
  },

  getUserProgress(userId: string): UserProgress | null {
    return this.getProgressForUser(userId);
  },

  // ============ МЕТОДЫ ДЛЯ ДИСЦИПЛИН ============
  
  updateDisciplineProgress(userId: string, discipline: 'math' | 'physics' | 'coding', taskPoints: number): void {
    let progress = this.getProgressForUser(userId);
    
    if (!progress) {
      // Если прогресса нет, инициализируем
      progress = this.initializeProgress(userId);
    }
    
    // Инициализируем прогресс по дисциплине, если его нет
    if (!progress[discipline]) {
      progress[discipline] = { 
        completed: 0, 
        points: 0,
        lastCompletedAt: new Date().toISOString()
      };
    }
    
    // Обновляем прогресс
    progress[discipline]!.completed += 1;
    progress[discipline]!.points += taskPoints;
    progress[discipline]!.lastCompletedAt = new Date().toISOString();
    
    // Обновляем общую статистику
    progress.points += taskPoints;
    progress.totalPoints = (progress.totalPoints || 0) + taskPoints;
    progress.totalTasksCompleted = (progress.totalTasksCompleted || 0) + 1;
    
    // Пересчитываем процент завершения
    const totalTasks = DISCIPLINE_CONSTANTS.TOTAL_TASKS;
    progress.completionRate = Math.round(((progress.totalTasksCompleted || 0) / totalTasks) * 100);
    
    // Обновляем серию активности
    this.updateStreak(progress);
    
    // Проверяем достижения
    this.checkAchievements(progress);
    
    this.saveProgress(userId, progress);
    
    // Добавляем активность
    this.addActivity(userId, {
      id: crypto.randomUUID(),
      type: "task_completed",
      title: `Задача по ${this.getDisciplineName(discipline)} завершена`,
      description: `Вы получили ${taskPoints} баллов`,
      points: taskPoints,
      timestamp: new Date().toISOString(),
      discipline: discipline,
      icon: this.getDisciplineIcon(discipline),
    });
  },

  getDisciplineName(discipline: 'math' | 'physics' | 'coding'): string {
    const names = {
      math: "Математике",
      physics: "Физике",
      coding: "Программированию"
    };
    return names[discipline];
  },

  getDisciplineIcon(discipline: 'math' | 'physics' | 'coding'): string {
    const icons = {
      math: "Calculator",
      physics: "Atom",
      coding: "Bot"
    };
    return icons[discipline];
  },

  // ============ МЕТОДЫ ДЛЯ УРОВНЕЙ ============
  
  getUserLevel(points: number): number {
    return Math.floor(points / LEVEL_CONSTANTS.POINTS_PER_LEVEL) + 1;
  },

  getLevelProgress(points: number): number {
    return points % LEVEL_CONSTANTS.POINTS_PER_LEVEL;
  },

  getPointsToNextLevel(points: number): number {
    return LEVEL_CONSTANTS.POINTS_PER_LEVEL - (points % LEVEL_CONSTANTS.POINTS_PER_LEVEL);
  },

  getLevelTitle(level: number): string {
    const titles = LEVEL_CONSTANTS.LEVEL_TITLES;
    
    // Находим ближайший меньший или равный уровень
    const availableLevels = Object.keys(titles).map(Number).sort((a, b) => b - a);
    const matchingLevel = availableLevels.find(l => level >= l) || 1;
    
    return titles[matchingLevel] || "Новичок";
  },

  // ============ МЕТОДЫ ДЛЯ ДОСТИЖЕНИЙ ============
  
  checkAchievements(progress: UserProgress): void {
    if (!progress.achievements) return;
    
    const updatedAchievements = progress.achievements.map(achievement => {
      if (achievement.unlocked) return achievement;
      
      let unlocked = false;
      
      switch (achievement.id) {
        case ACHIEVEMENT_TYPES.FIRST_STEPS.id:
          unlocked = (progress.totalTasksCompleted || 0) > 0;
          break;
          
        case ACHIEVEMENT_TYPES.MATH_MASTER.id:
          unlocked = progress.math?.completed === DISCIPLINE_CONSTANTS.MATH.TOTAL_TASKS;
          break;
          
        case ACHIEVEMENT_TYPES.PHYSICS_WIZARD.id:
          unlocked = progress.physics?.completed === DISCIPLINE_CONSTANTS.PHYSICS.TOTAL_TASKS;
          break;
          
        case ACHIEVEMENT_TYPES.CODE_NINJA.id:
          unlocked = progress.coding?.completed === DISCIPLINE_CONSTANTS.CODING.TOTAL_TASKS;
          break;
          
        case ACHIEVEMENT_TYPES.WEEK_STREAK.id:
          unlocked = (progress.streak || 0) >= 7;
          break;
          
        case ACHIEVEMENT_TYPES.POINT_MASTER.id:
          unlocked = progress.points >= 500;
          break;
          
        case ACHIEVEMENT_TYPES.COMPLETE_COURSE.id:
          unlocked = progress.math?.completed === DISCIPLINE_CONSTANTS.MATH.TOTAL_TASKS &&
                    progress.physics?.completed === DISCIPLINE_CONSTANTS.PHYSICS.TOTAL_TASKS &&
                    progress.coding?.completed === DISCIPLINE_CONSTANTS.CODING.TOTAL_TASKS;
          break;
      }
      
      if (unlocked && !achievement.unlocked) {
        // Награждаем баллами за достижение
        const achievementData = Object.values(ACHIEVEMENT_TYPES).find(a => a.id === achievement.id);
        if (achievementData?.pointsReward) {
          progress.points += achievementData.pointsReward;
        }
        
        // Добавляем активность
        this.addActivity(progress.userId, {
          id: crypto.randomUUID(),
          type: "achievement_unlocked",
          title: achievement.title,
          description: achievement.description,
          points: achievementData?.pointsReward,
          timestamp: new Date().toISOString(),
          icon: achievement.icon,
        });
        
        return {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };
      }
      
      return achievement;
    });
    
    progress.achievements = updatedAchievements;
  },

  // ============ МЕТОДЫ ДЛЯ АКТИВНОСТИ И СЕРИИ ============
  
  updateStreak(progress: UserProgress): void {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = progress.lastActive ? progress.lastActive.split('T')[0] : null;
    
    if (!lastActive) {
      progress.streak = 1;
    } else if (lastActive === today) {
      // Уже сегодня занимались - не меняем серию
      progress.streak = progress.streak || 0;
    } else if (this.isYesterday(lastActive, today)) {
      // Занимались вчера - увеличиваем серию
      progress.streak = (progress.streak || 0) + 1;
    } else {
      // Пропустили день - начинаем новую серию
      progress.streak = 1;
    }
    
    progress.lastActive = new Date().toISOString();
  },

  isYesterday(dateStr: string, todayStr: string): boolean {
    const date = new Date(dateStr);
    const today = new Date(todayStr);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return date.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
  },

  // ============ МЕТОДЫ ДЛЯ АКТИВНОСТЕЙ ============
  
  addActivity(userId: string, activity: any): void {
    try {
      const activitiesKey = `${STORAGE_KEYS.ACTIVITIES_PREFIX}${userId}`;
      const activities = this.getActivitiesForUser(userId);
      activities.unshift(activity);
      
      // Ограничиваем количество сохраняемых активностей
      if (activities.length > 50) {
        activities.pop();
      }
      
      localStorage.setItem(activitiesKey, JSON.stringify(activities));
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  },

  getActivitiesForUser(userId: string): any[] {
    try {
      const activitiesKey = `${STORAGE_KEYS.ACTIVITIES_PREFIX}${userId}`;
      const data = localStorage.getItem(activitiesKey);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error("Error getting activities:", error);
      return [];
    }
  },

  getActivities(): any[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];
    
    return this.getActivitiesForUser(currentUser.id);
  },

  // ============ СТАТИСТИКА ============
  
  getUserStats(userId: string) {
    const progress = this.getProgressForUser(userId);
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!progress || !user) {
      return {
        totalPoints: 0,
        completedTasks: 0,
        totalTasks: DISCIPLINE_CONSTANTS.TOTAL_TASKS,
        completionRate: 0,
        level: 1,
        streak: 0,
        lastActive: new Date().toLocaleDateString('ru-RU'),
        rank: "Новичок",
        achievementsUnlocked: 0,
        totalAchievements: DEFAULT_ACHIEVEMENTS.length,
        username: user?.username || "",
        email: user?.email || "",
      };
    }

    const completedTasks = (progress.math?.completed || 0) + 
                           (progress.physics?.completed || 0) + 
                           (progress.coding?.completed || 0);
    
    const totalPoints = progress.points || 0;
    const completionRate = progress.completionRate || 0;
    const level = this.getUserLevel(totalPoints);
    const streak = progress.streak || 0;
    const lastActive = progress.lastActive ? 
      new Date(progress.lastActive).toLocaleDateString('ru-RU') : 
      new Date().toLocaleDateString('ru-RU');
    
    const achievementsUnlocked = progress.achievements?.filter(a => a.unlocked).length || 0;
    const totalAchievements = progress.achievements?.length || DEFAULT_ACHIEVEMENTS.length;
    const rank = this.getLevelTitle(level);

    return {
      totalPoints,
      completedTasks,
      totalTasks: DISCIPLINE_CONSTANTS.TOTAL_TASKS,
      completionRate,
      level,
      streak,
      lastActive,
      rank,
      achievementsUnlocked,
      totalAchievements,
      username: user.username,
      email: user.email,
    };
  },

  getDisciplineProgress(userId: string) {
    const progress = this.getProgressForUser(userId);
    
    if (!progress) {
      return [
        {
          id: "math",
          name: "Математика",
          completed: 0,
          total: DISCIPLINE_CONSTANTS.MATH.TOTAL_TASKS,
          points: 0,
          progress: 0,
          color: "text-blue-400",
          gradient: "from-blue-600 to-cyan-500",
          bgColor: "bg-gradient-to-r from-blue-600/20 to-cyan-500/10"
        },
        {
          id: "physics",
          name: "Физика",
          completed: 0,
          total: DISCIPLINE_CONSTANTS.PHYSICS.TOTAL_TASKS,
          points: 0,
          progress: 0,
          color: "text-green-400",
          gradient: "from-green-600 to-emerald-500",
          bgColor: "bg-gradient-to-r from-green-600/20 to-emerald-500/10"
        },
        {
          id: "coding",
          name: "Программирование",
          completed: 0,
          total: DISCIPLINE_CONSTANTS.CODING.TOTAL_TASKS,
          points: 0,
          progress: 0,
          color: "text-purple-400",
          gradient: "from-purple-600 to-pink-500",
          bgColor: "bg-gradient-to-r from-purple-600/20 to-pink-500/10"
        }
      ];
    }

    return [
      {
        id: "math",
        name: "Математика",
        completed: progress.math?.completed || 0,
        total: DISCIPLINE_CONSTANTS.MATH.TOTAL_TASKS,
        points: progress.math?.points || 0,
        progress: Math.round(((progress.math?.completed || 0) / DISCIPLINE_CONSTANTS.MATH.TOTAL_TASKS) * 100),
        color: "text-blue-400",
        gradient: "from-blue-600 to-cyan-500",
        bgColor: "bg-gradient-to-r from-blue-600/20 to-cyan-500/10"
      },
      {
        id: "physics",
        name: "Физика",
        completed: progress.physics?.completed || 0,
        total: DISCIPLINE_CONSTANTS.PHYSICS.TOTAL_TASKS,
        points: progress.physics?.points || 0,
        progress: Math.round(((progress.physics?.completed || 0) / DISCIPLINE_CONSTANTS.PHYSICS.TOTAL_TASKS) * 100),
        color: "text-green-400",
        gradient: "from-green-600 to-emerald-500",
        bgColor: "bg-gradient-to-r from-green-600/20 to-emerald-500/10"
      },
      {
        id: "coding",
        name: "Программирование",
        completed: progress.coding?.completed || 0,
        total: DISCIPLINE_CONSTANTS.CODING.TOTAL_TASKS,
        points: progress.coding?.points || 0,
        progress: Math.round(((progress.coding?.completed || 0) / DISCIPLINE_CONSTANTS.CODING.TOTAL_TASKS) * 100),
        color: "text-purple-400",
        gradient: "from-purple-600 to-pink-500",
        bgColor: "bg-gradient-to-r from-purple-600/20 to-pink-500/10"
      }
    ];
  },

  // ============ СУЩЕСТВУЮЩИЕ МЕТОДЫ (для совместимости) ============
  
  updateRobotConfig(config: RobotConfig): void {
    const validated = robotConfigSchema.parse(config);
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    
    const progress = this.getProgressForUser(currentUser.id);
    if (progress) {
      progress.robotConfig = validated;
      this.saveProgress(currentUser.id, progress);
    }
  },

  updateCommand(command: ProgramCommand): void {
    const validated = programCommandSchema.parse(command);
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    
    const progress = this.getProgressForUser(currentUser.id);
    if (progress) {
      progress.lastCommand = validated;
      this.saveProgress(currentUser.id, progress);
    }
  },

  completeLevel(levelId: LevelId, points: number): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    
    const progress = this.getProgressForUser(currentUser.id);
    if (progress) {
      if (!progress.completedLevels.includes(levelId)) {
        progress.completedLevels.push(levelId);
        progress.points += points;
        progress.totalPoints = (progress.totalPoints || 0) + points;
        
        if (levelId === 3) {
          progress.currentLevel = 3;
        } else {
          progress.currentLevel = (levelId + 1) as LevelId;
        }
        
        this.saveProgress(currentUser.id, progress);
      }
    }
  },

  // Метод для сброса прогресса (для тестирования)
  resetProgress(userId: string): void {
    const progress = this.initializeProgress(userId);
    this.saveProgress(userId, progress);
  },

  // Очистка пользователя (для выхода)
  clearUser(): void {
    this.clearCurrentUser();
  },
};