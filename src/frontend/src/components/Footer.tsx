import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter, Zap } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer
      style={{ background: "var(--footer-bg)" }}
      className="border-t border-border"
    >
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-border">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-extrabold text-foreground">QuizFlow</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create, share, and track quizzes with ease. Built for friends,
              classrooms, and teams.
            </p>
          </div>

          {[
            {
              heading: "Product",
              links: ["Browse Quizzes", "Create Quiz", "Dashboard"],
            },
            { heading: "Company", links: ["About", "Blog", "Careers"] },
            { heading: "Resources", links: ["Docs", "Help Center", "API"] },
            { heading: "Legal", links: ["Privacy", "Terms", "Cookies"] },
          ].map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
                {col.heading}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-6 gap-4">
          <p className="text-xs text-muted-foreground">
            © {year}. Built with ❤️ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
