import { LevelConfig } from "../configs/level.config";

export function calculateXPForNextLevel(currentLevel: number): number {
    if (currentLevel < 1) {
        return 0;
    }
    return Math.floor(LevelConfig.LEVEL_START_XP * Math.pow(LevelConfig.LEVEL_GROWTH_RATE, currentLevel - 1));
}

export function calculatestartXPFromLevel(level: number): number {
    if (level <= 1) {
        return 0;
    }

    let total = 0;
    let required = LevelConfig.LEVEL_START_XP;

    for (let i = 2; i <= level; i++) {
        total += required;
        required *= LevelConfig.LEVEL_GROWTH_RATE;
    }

    return total;
}

export function calculateLevelFromXP(xp: number): number {
    if (xp < LevelConfig.LEVEL_START_XP) {
        return 1;
    }

    let level = 1;
    let total = 0;
    let required = LevelConfig.LEVEL_START_XP;
  
    // Opakujeme, dokud máme dost XP
    while (xp >= total + required) {
      total += required;
      required *= LevelConfig.LEVEL_GROWTH_RATE;
      level++;
    }

    return level;
}