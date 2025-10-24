import { z } from "zod";

export const MainConfigSchema = z.object({
  MARK_MAX_WEIGHT: z.number().min(0).max(100),
  MARK_MIN_WEIGHT: z.number().min(0).max(100),

  MIN_MARK: z.number().min(0).max(5),
  MAX_MARK: z.number().min(0).max(5),
  ALLOWED_MARKS: z.array(z.number()),
  MARK_DISPLAY: z.array(z.string()),

  MAX_POINTS: z.number().min(0).max(100),
  MIN_POINTS: z.number().min(0).max(100),

  MARK_MAX_TOPIC_LENGTH: z.number().min(0).max(999),
  MARK_MIN_TOPIC_LENGTH: z.number().min(0).max(10)
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
});

export const MainConfig = MainConfigSchema.parse({
  MARK_MAX_WEIGHT: 10,
  MARK_MIN_WEIGHT: 1,

  MIN_MARK: 0.8,
  MAX_MARK: 5,
  ALLOWED_MARKS: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
  MARK_DISPLAY: ["1", "1-", "2", "2-", "3", "3-", "4", "4-", "5"],

  MAX_POINTS: 100,
  MIN_POINTS: 1,

  MARK_MAX_TOPIC_LENGTH: 64,
  MARK_MIN_TOPIC_LENGTH: 2,
});
