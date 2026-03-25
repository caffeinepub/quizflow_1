import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Loader2, PlusCircle, Trash2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Question } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateQuiz, useIsAdmin } from "../hooks/useQueries";

let uidCounter = 0;
function genUid() {
  uidCounter += 1;
  return `uid-${uidCounter}`;
}

interface OptionDraft {
  uid: string;
  text: string;
}

interface QuestionDraft {
  uid: string;
  prompt: string;
  options: OptionDraft[];
  correctIndex: number;
}

const emptyQuestion = (): QuestionDraft => ({
  uid: genUid(),
  prompt: "",
  options: [
    { uid: genUid(), text: "" },
    { uid: genUid(), text: "" },
  ],
  correctIndex: 0,
});

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const createQuizMutation = useCreateQuiz();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    emptyQuestion(),
  ]);

  useEffect(() => {
    if (!adminLoading && (!identity || isAdmin === false)) {
      navigate({ to: "/admin/login" });
    }
  }, [isAdmin, adminLoading, identity, navigate]);

  const updateQuestion = (qUid: string, updates: Partial<QuestionDraft>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.uid === qUid ? { ...q, ...updates } : q)),
    );
  };

  const updateOption = (qUid: string, oUid: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.uid === qUid
          ? {
              ...q,
              options: q.options.map((o) =>
                o.uid === oUid ? { ...o, text } : o,
              ),
            }
          : q,
      ),
    );
  };

  const addOption = (qUid: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.uid === qUid && q.options.length < 4
          ? { ...q, options: [...q.options, { uid: genUid(), text: "" }] }
          : q,
      ),
    );
  };

  const removeOption = (qUid: string, oUid: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.uid !== qUid) return q;
        const newOptions = q.options.filter((o) => o.uid !== oUid);
        return {
          ...q,
          options: newOptions,
          correctIndex:
            q.correctIndex >= newOptions.length ? 0 : q.correctIndex,
        };
      }),
    );
  };

  const removeQuestion = (qUid: string) => {
    setQuestions((prev) => prev.filter((q) => q.uid !== qUid));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Quiz title is required.");
      return;
    }
    if (questions.length === 0) {
      toast.error("Add at least one question.");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) {
        toast.error(`Question ${i + 1} prompt is empty.`);
        return;
      }
      if (q.options.some((o) => !o.text.trim())) {
        toast.error(`Question ${i + 1} has empty options.`);
        return;
      }
    }
    const payload: Question[] = questions.map((q) => ({
      prompt: q.prompt,
      options: q.options.map((o) => o.text),
      correctIndex: BigInt(q.correctIndex),
    }));
    try {
      await createQuizMutation.mutateAsync({
        title,
        description,
        questions: payload,
      });
      toast.success("Quiz saved as draft!");
      navigate({ to: "/admin" });
    } catch {
      toast.error("Failed to save quiz. Please try again.");
    }
  };

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
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            data-ocid="admin.link"
          >
            <ChevronLeft className="w-4 h-4" />
            All Quizzes
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-8">
          <h1 className="text-2xl font-extrabold text-foreground mb-1">
            Create New Quiz
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Quiz is saved as a draft — publish when ready.
          </p>

          <div className="space-y-5 mb-8">
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-semibold mb-1.5 block"
              >
                Quiz Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. General Knowledge Challenge"
                className="rounded-xl h-11"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label
                htmlFor="desc"
                className="text-sm font-semibold mb-1.5 block"
              >
                Description
              </Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this quiz about?"
                className="rounded-xl resize-none"
                rows={3}
                data-ocid="admin.textarea"
              />
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((q, qi) => (
              <motion.div
                key={q.uid}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-border rounded-xl p-5 bg-card"
                data-ocid={`admin.item.${qi + 1}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-foreground">
                    Question {qi + 1}
                  </p>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.uid)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      data-ocid={`admin.delete_button.${qi + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                    Prompt
                  </Label>
                  <Input
                    value={q.prompt}
                    onChange={(e) =>
                      updateQuestion(q.uid, { prompt: e.target.value })
                    }
                    placeholder="Enter question prompt…"
                    className="rounded-xl h-10 text-sm"
                    data-ocid="admin.input"
                  />
                </div>

                <div className="space-y-2 mb-3">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase block">
                    Options
                  </Label>
                  <RadioGroup
                    value={String(q.correctIndex)}
                    onValueChange={(v) =>
                      updateQuestion(q.uid, { correctIndex: Number(v) })
                    }
                  >
                    {q.options.map((opt, oi) => (
                      <div key={opt.uid} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={String(oi)}
                          id={`${q.uid}-${opt.uid}`}
                          title="Mark as correct answer"
                        />
                        <Input
                          value={opt.text}
                          onChange={(e) =>
                            updateOption(q.uid, opt.uid, e.target.value)
                          }
                          placeholder={`Option ${String.fromCharCode(65 + oi)}…`}
                          className="flex-1 rounded-lg h-9 text-sm"
                          data-ocid="admin.input"
                        />
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(q.uid, opt.uid)}
                            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                            data-ocid={`admin.delete_button.${qi + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {q.options.length < 4 && (
                  <button
                    type="button"
                    onClick={() => addOption(q.uid)}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                    data-ocid="admin.button"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Option
                  </button>
                )}

                <p className="text-xs text-muted-foreground mt-2">
                  ✓ Select the radio button next to the correct answer.
                </p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              className="rounded-xl flex-1"
              onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
              data-ocid="admin.secondary_button"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Another Question
            </Button>
            <Button
              className="rounded-xl flex-1 bg-primary text-primary-foreground font-semibold hover:opacity-90"
              onClick={handleSave}
              disabled={createQuizMutation.isPending}
              data-ocid="admin.save_button"
            >
              {createQuizMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : (
                "Save Quiz as Draft"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
