import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/meku/Logo";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * Auth — editorial split, oversized wordmark, success-check on completion.
 * Phase 5 — taste (radial mesh not flat purple), transitions-dev (texts-reveal + success-check),
 * ui-ux-pro-max (no meta labels, 2-line H1).
 */
const Auth = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (session) {
      // Small delay lets the success-check finish before route swap.
      const t = setTimeout(() => navigate("/home", { replace: true }), done ? 620 : 0);
      return () => clearTimeout(t);
    }
  }, [session, navigate, done]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/home` },
        });
        if (error) throw error;
        toast.success("Welcome to MEKU");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      setDone(true);
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const reveal = (delay: number) =>
    reduce
      ? { initial: false, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 10, filter: "blur(3px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 55% at 50% -20%, hsl(var(--primary) / 0.16), transparent 60%), radial-gradient(70% 40% at 0% 100%, hsl(var(--primary-glow) / 0.12), transparent 55%)",
        }}
      />

      <div className="relative mx-auto flex min-h-svh w-full max-w-[440px] flex-col px-6 pb-8 pt-14">
        <motion.div className="flex justify-center" {...reveal(0)}>
          <Logo size={56} appIcon wordmark={false} />
        </motion.div>

        <motion.h1
          className="mt-8 text-center text-foreground"
          style={{ fontWeight: 700, fontSize: "clamp(28px, 8vw, 34px)", letterSpacing: "-0.025em", lineHeight: 1.1 }}
          {...reveal(0.08)}
        >
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </motion.h1>
        <motion.p className="mt-2 text-center text-[14px] text-muted-foreground" {...reveal(0.14)}>
          {mode === "signup" ? "It only takes a moment." : "Sign in to continue."}
        </motion.p>

        <motion.form onSubmit={submit} className="mt-8 space-y-3" {...reveal(0.2)}>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="h-[52px] w-full rounded-[var(--r3)] border border-border bg-surface px-4 text-[15px] outline-none transition-colors duration-[160ms] focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="h-[52px] w-full rounded-[var(--r3)] border border-border bg-surface px-4 text-[15px] outline-none transition-colors duration-[160ms] focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={busy || done}
            className="tap flex h-[52px] w-full items-center justify-center overflow-hidden rounded-[var(--r3)] bg-primary text-[15px] font-bold text-primary-foreground transition-[transform,opacity] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.985] disabled:opacity-70 motion-reduce:active:scale-100"
            style={{ boxShadow: "0 14px 32px -12px hsl(var(--primary) / 0.55)" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <motion.span
                  key="done"
                  initial={reduce ? false : { scale: 0.4, opacity: 0, filter: "blur(2px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.45, ease: [0.34, 1.35, 0.64, 1] }}
                  className="inline-flex items-center gap-2"
                >
                  <Check className="h-5 w-5" strokeWidth={2.6} /> Signed in
                </motion.span>
              ) : busy ? (
                <motion.span key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader2 className="h-5 w-5 animate-spin" />
                </motion.span>
              ) : (
                <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {mode === "signup" ? "Create account" : "Sign in"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.form>

        <motion.button
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="tap mt-6 text-center text-[14px] text-muted-foreground transition-colors hover:text-foreground"
          {...reveal(0.28)}
        >
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
        </motion.button>

        <Link to="/" className="tap mt-auto pt-6 text-center text-[13px] text-muted-foreground transition-colors hover:text-foreground">
          ← Back
        </Link>
      </div>
    </main>
  );
};

export default Auth;
