import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Globe,
  LayoutDashboard,
  Loader2,
  LogOut,
  PlusCircle,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { QuizStatus } from "../backend";
import type { Quiz } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllQuizzes,
  useDeleteQuiz,
  useIsAdmin,
  usePublishQuiz,
  useQuizSubmissions,
  useUnpublishQuiz,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c", "sk-d"];

function QuizRow({ quiz, index }: { quiz: Quiz; index: number }) {
  const { data: submissions } = useQuizSubmissions(quiz.id);
  const publishMutation = usePublishQuiz();
  const unpublishMutation = useUnpublishQuiz();
  const deleteMutation = useDeleteQuiz();
  const navigate = useNavigate();

  const isPublished = quiz.status === QuizStatus.published;
  const subCount = submissions?.length ?? 0;

  const handleTogglePublish = async () => {
    try {
      if (isPublished) {
        await unpublishMutation.mutateAsync(quiz.id);
        toast.success(`"${quiz.title}" unpublished.`);
      } else {
        await publishMutation.mutateAsync(quiz.id);
        toast.success(`"${quiz.title}" published!`);
      }
    } catch {
      toast.error("Failed to update quiz status.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${quiz.title}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(quiz.id);
      toast.success("Quiz deleted.");
    } catch {
      toast.error("Failed to delete quiz.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-card border border-border rounded-xl"
      data-ocid={`admin.item.${index + 1}`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">
          {quiz.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {quiz.description}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <Badge
          variant={isPublished ? "default" : "secondary"}
          className={`text-xs font-medium ${
            isPublished
              ? "bg-green-100 text-green-700 border-green-200"
              : "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {isPublished ? "Published" : "Draft"}
        </Badge>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {quiz.questions.length} Q
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
          <Users className="w-3 h-3" /> {subCount}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="h-8 rounded-lg text-xs"
          onClick={handleTogglePublish}
          disabled={publishMutation.isPending || unpublishMutation.isPending}
          data-ocid={`admin.toggle.${index + 1}`}
        >
          {isPublished ? (
            <>
              <EyeOff className="w-3 h-3 mr-1" />
              Unpublish
            </>
          ) : (
            <>
              <Globe className="w-3 h-3 mr-1" />
              Publish
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 rounded-lg text-xs"
          onClick={() =>
            navigate({
              to: "/admin/quiz/$id/submissions",
              params: { id: quiz.id.toString() },
            })
          }
          data-ocid={`admin.secondary_button.${index + 1}`}
        >
          <Eye className="w-3 h-3 mr-1" />
          Submissions
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 rounded-lg text-xs text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          data-ocid={`admin.delete_button.${index + 1}`}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: quizzes, isLoading: quizzesLoading } = useAllQuizzes();

  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      navigate({ to: "/admin/login" });
    }
    if (!identity && !adminLoading) {
      navigate({ to: "/admin/login" });
    }
  }, [isAdmin, adminLoading, identity, navigate]);

  const handleLogout = () => {
    clear();
    navigate({ to: "/admin/login" });
  };

  if (adminLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground bg-accent"
            data-ocid="admin.link"
          >
            <LayoutDashboard className="w-4 h-4" />
            All Quizzes
          </Link>
          <Link
            to="/admin/quiz/new"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            data-ocid="admin.link"
          >
            <PlusCircle className="w-4 h-4" />
            Create Quiz
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <button
            type="button"
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={handleLogout}
            data-ocid="admin.button"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">
                All Quizzes
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage, publish, and track your quizzes.
              </p>
            </div>
            <Button
              className="rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90"
              onClick={() => navigate({ to: "/admin/quiz/new" })}
              data-ocid="admin.primary_button"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </div>

          {quizzesLoading ? (
            <div className="space-y-3" data-ocid="admin.loading_state">
              {SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (quizzes ?? []).length === 0 ? (
            <div
              className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl"
              data-ocid="admin.empty_state"
            >
              <LayoutDashboard className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">No quizzes yet.</p>
              <p className="text-sm mt-1">
                Create your first quiz to get started.
              </p>
              <Button
                className="mt-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90"
                onClick={() => navigate({ to: "/admin/quiz/new" })}
                data-ocid="admin.primary_button"
              >
                Create Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {(quizzes ?? []).map((quiz, i) => (
                <QuizRow key={quiz.id.toString()} quiz={quiz} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
