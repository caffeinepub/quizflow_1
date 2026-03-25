import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle, Trophy, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { getQuizResult } from "../quizResultStore";

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function ResultsPage() {
  const navigate = useNavigate();
  const state = getQuizResult();

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No results found.</p>
        <Button
          onClick={() => navigate({ to: "/" })}
          data-ocid="results.primary_button"
        >
          Back to Quizzes
        </Button>
      </div>
    );
  }

  const { submission, questions } = state;
  const total = questions.length;
  const score = Number(submission.score);
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const scoreColor =
    pct >= 80
      ? "text-green-600"
      : pct >= 50
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ background: "var(--hero-bg)" }}
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-border shadow-card p-8 text-center mb-8"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-1">
            Check Your Progress
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Great job,{" "}
            <span className="font-semibold text-foreground">
              {submission.participantName}
            </span>
            !
          </p>
          <p className={`text-5xl font-extrabold ${scoreColor} mb-1`}>
            {score}/{total}
          </p>
          <p className="text-sm text-muted-foreground">{pct}% correct</p>
        </motion.div>

        <div className="space-y-4">
          {questions.map((q, qi) => {
            const userAnswer = Number(submission.answers[qi] ?? -1);
            const correctAnswer = Number(submission.correctAnswers[qi] ?? -1);
            const isCorrect = userAnswer === correctAnswer;

            return (
              <motion.div
                key={q.prompt}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: qi * 0.05 }}
                className="bg-white rounded-xl border border-border shadow-xs overflow-hidden"
                data-ocid={`results.item.${qi + 1}`}
              >
                <div
                  className={`flex items-center gap-3 px-5 py-3 border-b ${
                    isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <p className="text-sm font-semibold text-foreground">
                    Q{qi + 1}: {q.prompt}
                  </p>
                </div>

                <div className="p-4 space-y-2">
                  {q.options.map((opt) => {
                    const optIndex = q.options.indexOf(opt);
                    const isUserChoice = optIndex === userAnswer;
                    const isCorrectChoice = optIndex === correctAnswer;

                    let cls =
                      "flex items-center gap-2 p-2.5 rounded-lg text-sm ";
                    if (isCorrectChoice) {
                      cls +=
                        "bg-green-50 border border-green-300 text-green-800";
                    } else if (isUserChoice && !isCorrect) {
                      cls += "bg-red-50 border border-red-300 text-red-700";
                    } else {
                      cls += "border border-transparent text-muted-foreground";
                    }

                    return (
                      <div key={opt} className={cls}>
                        <span className="w-5 h-5 rounded-full bg-white border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {OPTION_LABELS[optIndex]}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isCorrectChoice && (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                        {isUserChoice && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Button
            className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90"
            onClick={() => navigate({ to: "/" })}
            data-ocid="results.primary_button"
          >
            Take Another Quiz
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
