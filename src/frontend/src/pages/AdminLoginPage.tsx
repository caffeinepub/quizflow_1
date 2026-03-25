import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { KeyRound, Loader2, LogIn, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const {
    login,
    isLoggingIn,
    isInitializing,
    isLoginSuccess,
    isLoginError,
    loginError,
    identity,
    clear,
  } = useInternetIdentity();
  const {
    data: isAdmin,
    isLoading: adminLoading,
    refetch: refetchAdmin,
  } = useIsAdmin();
  const { actor } = useActor();

  const [showSetup, setShowSetup] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (identity && isAdmin === true) {
      navigate({ to: "/admin" });
    } else if (identity && isAdmin === false && !adminLoading) {
      setShowSetup(true);
    }
  }, [identity, isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isLoginError && loginError) {
      toast.error(loginError.message || "Login failed.");
    }
  }, [isLoginError, loginError]);

  async function handleClaimAdmin() {
    if (!actor || !adminToken.trim()) return;
    setClaiming(true);
    try {
      await actor._initializeAccessControlWithSecret(adminToken.trim());
      const result = await refetchAdmin();
      if (result.data === true) {
        toast.success("Admin access granted!");
        navigate({ to: "/admin" });
      } else {
        toast.error("Incorrect token or admin slot already taken.");
      }
    } catch {
      toast.error(
        "Failed to claim admin access. Check the token and try again.",
      );
    } finally {
      setClaiming(false);
    }
  }

  const isButtonBusy =
    isInitializing || isLoggingIn || (isLoginSuccess && adminLoading);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--hero-bg)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-2xl shadow-card border border-border p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-xl text-foreground">
            QuizFlow
          </span>
        </div>

        {!showSetup ? (
          <>
            <h1 className="text-xl font-bold text-foreground text-center mb-1">
              Admin Sign In
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Authenticate with Internet Identity to access the admin dashboard.
            </p>
            <Button
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90"
              onClick={login}
              disabled={isButtonBusy}
              data-ocid="admin.primary_button"
            >
              {isButtonBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isInitializing ? "Loading…" : "Signing in…"}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In with Internet Identity
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Secure authentication powered by the Internet Computer.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground text-center mb-1">
              Claim Admin Access
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              First-time setup: enter the admin token to register this account
              as admin.
            </p>
            <div className="space-y-3 mb-4">
              <Input
                type="password"
                placeholder="Admin token"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleClaimAdmin()}
                className="h-11 rounded-xl"
              />
              <Button
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90"
                onClick={handleClaimAdmin}
                disabled={claiming || !adminToken.trim()}
              >
                {claiming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Claim Admin Access
                  </>
                )}
              </Button>
            </div>
            <button
              type="button"
              onClick={() => {
                clear();
                setShowSetup(false);
                setAdminToken("");
              }}
              className="text-xs text-muted-foreground underline w-full text-center block mb-4"
            >
              Sign out and use a different account
            </button>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <p className="font-semibold mb-0.5">Where is the admin token?</p>
              <p>
                Find it in your Caffeine project settings under Environment
                Variables as <code>CAFFEINE_ADMIN_TOKEN</code>.
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
