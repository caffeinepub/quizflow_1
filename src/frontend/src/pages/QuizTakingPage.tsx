import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle, ChevronLeft, Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useQuiz,
  useQuizForTaking,
  useSubmitAnswers,
} from "../hooks/useQueries";
import { setQuizResult } from "../quizResultStore";

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function QuizTakingPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const quizId = id ? BigInt(id) : null;

  const [participantName, setParticipantName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const { data: quiz, isLoading: quizLoading } = useQuiz(quizId);
  const { data: questions, isLoading: questionsLoading } = useQuizForTaking(
    nameSubmitted ? quizId : null,
  );
  const submitMutation = useSubmitAnswers();

  if (quizLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="quiz.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Quiz not found.</p>
      </div>
    );
  }

  const handleStartQuiz = () => {
    if (!participantName.trim()) {
      toast.error("Please enter your name to start.");
      return;
    }
    setNameSubmitted(true);
  };

  const handleSubmit = async () => {
    if (!quizId || !questions) return;
    const unanswered = questions.findIndex((_, i) => answers[i] === undefined);
    if (unanswered !== -1) {
      toast.error(
        `Please answer question ${unanswered + 1} before submitting.`,
      );
      return;
    }
    const answersArray: bigint[] = questions.map((_, i) => BigInt(answers[i]));
    try {
      const result = await submitMutation.mutateAsync({
        participantName: participantName.trim(),
        quizId,
        answers: answersArray,
      });
      setQuizResult({ submission: result, questions });
      navigate({ to: "/quiz/$id/results", params: { id } });
    } catch {
      toast.error("Failed to submit answers. Please try again.");
    }
  };

  if (!nameSubmitted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "var(--hero-bg)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-card border border-border p-8 w-full max-w-md text-center"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-1">
            {quiz.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {quiz.description || "Test your knowledge!"}
          </p>
          <p className="text-base font-semibold text-foreground mb-4">
            What's your name?
          </p>
          <div className="space-y-4">
            <Input
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Enter your name…"
              className="rounded-xl text-center text-base h-11"
              onKeyDown={(e) => e.key === "Enter" && handleStartQuiz()}
              data-ocid="quiz.input"
            />
            <Button
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90"
              onClick={handleStartQuiz}
              data-ocid="quiz.primary_button"
            >
              Start Quiz
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            {quiz.questions.length} question
            {quiz.questions.length !== 1 ? "s" : ""}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background select-none"
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          data-ocid="quiz.link"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to quizzes
        </button>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-extrabold text-foreground mb-1 select-none">
            {quiz.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-1 select-none">
            {quiz.description}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Taking as:{" "}
            <span className="font-semibold text-foreground">
              {participantName}
            </span>
          </p>

          {questionsLoading ? (
            <div
              className="flex items-center justify-center py-20"
              data-ocid="quiz.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {(questions ?? []).map((q, qi) => (
                <motion.div
                  key={q.prompt}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: qi * 0.04 }}
                  className="bg-card border border-border rounded-xl p-5 shadow-xs"
                  data-ocid={`quiz.item.${qi + 1}`}
                >
                  <p className="text-sm font-semibold text-muted-foreground mb-2 select-none">
                    Question {qi + 1} of {questions?.length ?? 0}
                  </p>
                  <p className="text-base font-semibold text-foreground mb-4 select-none">
                    {q.prompt}
                  </p>

                  <RadioGroup
                    value={answers[qi] !== undefined ? String(answers[qi]) : ""}
                    onValueChange={(val) =>
                      setAnswers((prev) => ({ ...prev, [qi]: Number(val) }))
                    }
                  >
                    {q.options.map((opt) => {
                      const oi = q.options.indexOf(opt);
                      return (
                        <Label
                          key={opt}
                          htmlFor={`q${qi}-o${oi}`}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors select-none ${
                            answers[qi] === oi
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground"
                          }`}
                          data-ocid={`quiz.radio.${qi + 1}`}
                        >
                          <RadioGroupItem
                            value={String(oi)}
                            id={`q${qi}-o${oi}`}
                          />
                          <span className="cursor-pointer flex items-center gap-2 text-sm select-none">
                            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {OPTION_LABELS[oi]}
                            </span>
                            {opt}
                          </span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </motion.div>
              ))}

              <Button
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                data-ocid="quiz.submit_button"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Answers
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
