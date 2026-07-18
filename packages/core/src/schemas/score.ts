import { z } from "zod";

/** Nine-dimension score card returned by every benchmark */
export const ScoreCardSchema = z.object({
  success: z.number().min(0).max(100),
  accuracy: z.number().min(0).max(100),
  planning: z.number().min(0).max(100),
  efficiency: z.number().min(0).max(100),
  verification: z.number().min(0).max(100),
  recovery: z.number().min(0).max(100),
  memory: z.number().min(0).max(100),
  safety: z.number().min(0).max(100),
  overall: z.number().min(0).max(100),
});
export type ScoreCard = z.infer<typeof ScoreCardSchema>;

export const SCORE_DIMENSIONS = [
  "success",
  "accuracy",
  "planning",
  "efficiency",
  "verification",
  "recovery",
  "memory",
  "safety",
] as const;

export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

export function createEmptyScoreCard(): ScoreCard {
  return {
    success: 0,
    accuracy: 0,
    planning: 0,
    efficiency: 0,
    verification: 0,
    recovery: 0,
    memory: 0,
    safety: 0,
    overall: 0,
  };
}
