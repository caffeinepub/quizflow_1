import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-ocid="nav.link">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg text-foreground tracking-tight">
            QuizFlow
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-semibold text-foreground"
            data-ocid="nav.link"
          >
            Browse Quizzes
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.link"
          >
            Admin Login
          </Link>
          <Button
            asChild
            size="sm"
            className="rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90"
          >
            <Link to="/admin/login" data-ocid="nav.primary_button">
              Sign Up Free
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
