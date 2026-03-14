import { z } from "zod";

export const MainConfigSchema = z.object({
  MARK_MAX_WEIGHT: z.number().min(0).max(100),
  MARK_MIN_WEIGHT: z.number().min(0).max(100),

  SEMESTER_START_MONTH: z.number().min(1).max(12),
  SEMESTER_END_MONTH: z.number().min(1).max(12),

  MIN_MARK: z.number().min(0).max(5),
  MAX_MARK: z.number().min(0).max(5),
  MIN_QUARTER: z.number().min(1).max(4),
  MAX_QUARTER: z.number().min(1).max(4),
  ALLOWED_MARKS: z.array(z.number()),
  MARK_DISPLAY: z.array(z.string()),
  MARK_ACTIONS: z.array(z.string()),

  MAX_POINTS: z.number().min(0).max(100),
  MIN_POINTS: z.number().min(0).max(100),

  MARK_MAX_TOPIC_LENGTH: z.number().min(0).max(999),
  MARK_MIN_TOPIC_LENGTH: z.number().min(0).max(10),

  MAX_BEHAVE_MARK: z.number().min(1).max(10).default(3),

  MARKING_SCALE: z.array(z.number().min(0).max(100)),

  DEFAULT_NOTIFICATION: z.array(z.string())
})
  .refine(d => d.MARK_MAX_WEIGHT >= d.MARK_MIN_WEIGHT, {
    message: "MARK_MAX_WEIGHT cannot be smaller than MARK_MIN_WEIGHT",
  })
  .refine(d => d.MAX_MARK >= d.MIN_MARK, {
    message: "MAX_MARK cannot be smaller than MIN_MARK",
  })
  .refine(d => d.ALLOWED_MARKS.length === d.MARK_DISPLAY.length, {
    message: "ALLOWED_MARKS must be the same length as MARK_DISPLAY",
  })
  .refine(d => d.MAX_POINTS >= d.MIN_POINTS, {
    message: "MAX_POINTS cannot be smaller than MIN_POINTS",
  })
  .refine(d => d.MAX_QUARTER >= d.MIN_QUARTER, {
    message: "MAX_QUARTER cannot be smaller than MIN_QUARTER",
  })


export const MainConfig = MainConfigSchema.parse({
  MARK_MAX_WEIGHT: 10,
  MARK_MIN_WEIGHT: 1,

  SEMESTER_START_MONTH: 9, // 9 = September
  SEMESTER_END_MONTH: 6, // 6 = June

  MIN_MARK: 0.8,
  MAX_MARK: 5,
  MIN_QUARTER: 1,
  MAX_QUARTER: 4,
  ALLOWED_MARKS: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
  MARK_DISPLAY: ["1", "1-", "2", "2-", "3", "3-", "4", "4-", "5"],
  MARK_ACTIONS: ["A", "N", "O", "P", "?"],

  MAX_POINTS: 100,
  MIN_POINTS: 1,

  MARK_MAX_TOPIC_LENGTH: 64,
  MARK_MIN_TOPIC_LENGTH: 2,

  MAX_BEHAVE_MARK: 3,

  MARKING_SCALE: [90, 75, 60, 45],

  DEFAULT_NOTIFICATION: ["grade_new", "homework_new", "message_new", "absence_new", "substitution_new", "announcement"]
});
