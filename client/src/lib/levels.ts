import type { Level, LevelId } from "@shared/schema";

export const LEVELS: Record<LevelId, Omit<Level, "unlocked" | "completed">> = {
  1: {
    id: 1,
    title: "Простой старт",
    description: "Научитесь программировать робота для движения по прямой линии",
    objective: "Доставьте робота к зелёной зоне, двигаясь прямо",
    difficulty: "easy",
    pointsReward: 10,
  },
  2: {
    id: 2,
    title: "Обход препятствий",
    description: "Используйте датчик для навигации вокруг препятствий",
    objective: "Достигните цели, избегая красные препятствия",
    difficulty: "medium",
    pointsReward: 20,
  },
  3: {
    id: 3,
    title: "Доставка груза",
    description: "Доставьте груз в больницу с ограничением по времени",
    objective: "Доставьте жёлтый груз к зелёной зоне за 30 секунд",
    difficulty: "hard",
    pointsReward: 30,
  },
};

export function getLevelById(id: LevelId, completedLevels: LevelId[]): Level {
  const baseLevel = LEVELS[id];
  return {
    ...baseLevel,
    unlocked: id === 1 || completedLevels.includes((id - 1) as LevelId),
    completed: completedLevels.includes(id),
  };
}
