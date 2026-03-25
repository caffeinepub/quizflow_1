import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Quiz } from "../backend";
import Footer from "../components/Footer";
import PublicHeader from "../components/PublicHeader";
import { usePublishedQuizzes } from "../hooks/useQueries";

const GRADIENTS = [
  "from-blue-400 via-indigo-500 to-purple-600",
  "from-emerald-400 via-teal-500 to-cyan-600",
  "from-orange-400 via-rose-500 to-pink-600",
  "from-violet-400 via-purple-500 to-indigo-600",
  "from-amber-400 via-orange-500 to-red-600",
  "from-teal-400 via-cyan-500 to-blue-600",
  "from-pink-400 via-fuchsia-500 to-purple-600",
  "from-lime-400 via-green-500 to-emerald-600",
];

const CATEGORIES = [
  "All",
  "Science",
  "History",
  "Math",
  "Literature",
  "Technology",
  "Geography",
  "Pop Culture",
];

const SKELETON_KEYS = [
  "sk-a",
  "sk-b",
  "sk-c",
  "sk-d",
  "sk-e",
  "sk-f",
  "sk-g",
  "sk-h",
];

function QuizCard({ quiz, index }: { quiz: Quiz; index: number }) {
  const navigate = useNavigate();
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card border border-border rounded-xl shadow-card overflow-hidden flex flex-col"
      data-ocid={`quiz.item.${index + 1}`}
    >
      <div
        className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}
      >
        <BookOpen className="w-10 h-10 text-white opacity-80" />
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-base text-foreground leading-snug mb-1 line-clamp-2">
          {quiz.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
          {quiz.description || "Test your knowledge with this quiz!"}
        </p>

        <div className="grid grid-cols-3 gap-1 mb-4 py-2 border-y border-border">
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">
              {quiz.questions.length}
            </p>
            <p className="text-[10px] text-muted-foreground">Questions</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-sm font-bold text-foreground">Mixed</p>
            <p className="text-[10px] text-muted-foreground">Difficulty</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">∞</p>
            <p className="text-[10px] text-muted-foreground">Takes</p>
          </div>
        </div>

        <Button
          className="w-full rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90"
          onClick={() =>
            navigate({ to: "/quiz/$id", params: { id: quiz.id.toString() } })
          }
          data-ocid={`quiz.primary_button.${index + 1}`}
        >
          Take Quiz
        </Button>
      </div>
    </motion.div>
  );
}

function QuizCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Skeleton className="h-32 rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: quizzes, isLoading } = usePublishedQuizzes();

  const filtered = (quizzes ?? []).filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <section
        style={{ background: "var(--hero-bg)" }}
        className="py-12 md:py-16"
      >
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-5"
          >
            Browse Quizzes
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative max-w-xl mx-auto mb-5"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, keyword, creator…"
              className="pl-10 rounded-xl border-border shadow-xs bg-white h-11 text-sm"
              data-ocid="quiz.search_input"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                }`}
                data-ocid="quiz.tab"
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      <main className="flex-1 bg-white py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Public Cards
            </h2>
            {!isLoading && (
              <span className="text-sm text-muted-foreground">
                {filtered.length} quiz{filtered.length !== 1 ? "zes" : ""}{" "}
                available
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SKELETON_KEYS.map((k) => (
                <QuizCardSkeleton key={k} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-20 text-muted-foreground"
              data-ocid="quiz.empty_state"
            >
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">
                {search
                  ? "No quizzes match your search."
                  : "No quizzes published yet."}
              </p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.map((quiz, i) => (
                <QuizCard key={quiz.id.toString()} quiz={quiz} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
