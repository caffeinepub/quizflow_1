import type { QuestionOutput, Submission } from "./backend";

export interface QuizResult {
  submission: Submission;
  questions: QuestionOutput[];
}

let stored: QuizResult | null = null;

export function setQuizResult(r: QuizResult): void {
  stored = r;
}

export function getQuizResult(): QuizResult | null {
  const r = stored;
  stored = null;
  return r;
}
