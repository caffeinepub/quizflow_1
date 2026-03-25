import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Loader2,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Submission } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin, useQuiz, useQuizSubmissions } from "../hooks/useQueries";

const OPTION_LABELS = ["A", "B", "C", "D"];
const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c", "sk-d"];

type QuizData = NonNullable<ReturnType<typeof useQuiz>["data"]>;

function SubmissionRow({
  submission,
  quiz,
  index,
}: {
  submission: Submission;
  quiz: QuizData;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const total = quiz.questions.length;
  const score = Number(submission.score);
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const date = new Date(
    Number(submission.timestamp / BigInt(1_000_000)),
  ).toLocaleString();

  return (
    <div
      className="border border-border rounded-xl overflow-hidden"
      data-ocid={`submissions.item.${index + 1}`}
    >
      <button
        type="button"
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded((p) => !p)}
        data-ocid={`submissions.toggle.${index + 1}`}
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">
            {submission.participantName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
        </div>
        <Badge
          className={`text-xs ${
            pct >= 80
              ? "bg-green-100 text-green-700 border-green-200"
              : pct >= 50
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-red-100 text-red-600 border-red-200"
          }`}
        >
          {score}/{total} ({pct}%)
        </Badge>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border px-4 py-3 space-y-3 bg-muted/30"
        >
          {quiz.questions.map((q) => {
            const qi = quiz.questions.indexOf(q);
            const userAns = Number(submission.answers[qi] ?? -1);
            const correctAns = Number(submission.correctAnswers[qi] ?? -1);
            const isCorrect = userAns === correctAns;

            return (
              <div key={q.prompt} className="text-sm">
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">
                      {q.prompt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Answered:{" "}
                      <span
                        className={
                          isCorrect
                            ? "text-green-700 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {OPTION_LABELS[userAns] ?? "—"}:{" "}
                        {q.options[userAns] ?? "No answer"}
                      </span>
                      {!isCorrect && (
                        <span className="ml-2 text-green-700">
                          ✓ Correct: {OPTION_LABELS[correctAns]}:{" "}
                          {q.options[correctAns]}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default function SubmissionsPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const quizId = id ? BigInt(id) : null;
  const { data: quiz, isLoading: quizLoading } = useQuiz(quizId);
  const { data: submissions, isLoading: subsLoading } =
    useQuizSubmissions(quizId);

  useEffect(() => {
    if (!adminLoading && (!identity || isAdmin === false)) {
      navigate({ to: "/admin/login" });
    }
  }, [isAdmin, adminLoading, identity, navigate]);

  const isLoading = quizLoading || subsLoading || adminLoading;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-56 shrink-0 border-r border-border bg-sidebar flex flex-col">
        <div className="p-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-foreground">QuizFlow</span>
          </Link>
        </div>
        <nav className="flex-1 p-4">
          <Link
            to="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            data-ocid="admin.link"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-8">
          {isLoading ? (
            <div className="space-y-4" data-ocid="submissions.loading_state">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              {SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-foreground mb-1">
                  {quiz?.title ?? "Submissions"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {(submissions ?? []).length} submission
                  {(submissions ?? []).length !== 1 ? "s" : ""}
                </p>
              </div>

              {(submissions ?? []).length === 0 ? (
                <div
                  className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl"
                  data-ocid="submissions.empty_state"
                >
                  <p className="text-base font-medium">No submissions yet.</p>
                  <p className="text-sm mt-1">
                    Share the quiz link with your friends!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(submissions ?? []).map((sub, i) =>
                    quiz ? (
                      <SubmissionRow
                        key={`${sub.participantName}-${i}`}
                        submission={sub}
                        quiz={quiz}
                        index={i}
                      />
                    ) : null,
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
