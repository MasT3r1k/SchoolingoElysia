import z from "zod";

export namespace LevelConfig {
    export const LEVEL_START_XP = z.number().default(50);
    export const LEVEL_MAX_XP = z.number().default(100);
    export const LEVEL_GROWTH_RATE = z.number().default(2.5);
} 