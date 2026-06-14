import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/meku/Logo";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate("/home", { replace: true });
  }, [session, navigate]);

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
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-svh max-w-[440px] flex-col bg-background px-6 pb-10 pt-16">
      <div className="flex justify-center">
        <Logo size={56} appIcon wordmark={false} />
      </div>
      <h1 className="mt-8 text-center text-[28px] font-bold tracking-[-0.02em] text-foreground">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-center text-[14px] text-muted-foreground">
        {mode === "signup" ? "It only takes a moment." : "Sign in to continue."}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="h-[52px] w-full rounded-2xl border border-border bg-surface px-4 text-[15px] outline-none focus:border-primary"
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="h-[52px] w-full rounded-2xl border border-border bg-surface px-4 text-[15px] outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy}
          className="tap flex h-[52px] w-full items-center justify-center rounded-2xl bg-primary text-[15px] font-bold text-primary-foreground disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        className="tap mt-6 text-center text-[14px] text-muted-foreground"
      >
        {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>

      <Link to="/" className="tap mt-auto pt-6 text-center text-[13px] text-muted-foreground">
        ← Back
      </Link>
    </main>
  );
};

export default Auth;
