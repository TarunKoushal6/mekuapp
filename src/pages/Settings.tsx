import { AppShell } from "@/components/meku/AppShell";
import { ChevronLeft, LogOut, Bell, Lock, Palette, HelpCircle, Wallet, FileText, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Row = ({ icon: Icon, label, to, onClick, danger }: any) => {
  const content = (
    <div className={`flex h-[56px] items-center gap-3 px-4 ${danger ? "text-[#ef3b6b]" : "text-foreground"}`}>
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {!onClick && <ChevronRight className="h-[16px] w-[16px] text-muted-foreground" strokeWidth={1.7} />}
    </div>
  );
  if (to) return <Link to={to} className="tap block hairline-b">{content}</Link>;
  return <button onClick={onClick} className="tap block w-full text-left hairline-b">{content}</button>;
};

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <AppShell hideNav>
      <header className="sticky top-0 z-30 flex h-[56px] items-center bg-background/90 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.6} />
        </button>
        <h1 className="text-[16px] font-bold">Settings</h1>
      </header>

      {user && (
        <section className="px-4 py-4">
          <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Account</p>
          <p className="mt-1 text-[15px] text-foreground">{user.email}</p>
        </section>
      )}

      <nav>
        <p className="px-4 pt-2 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Profile</p>
        <Row icon={FileText} label="Edit profile" to="/settings/profile" />

        <p className="px-4 pt-5 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Preferences</p>
        <Row icon={Bell} label="Notifications" to="/notifications" />
        <Row icon={Palette} label="Appearance" to="/settings/appearance" />
        <Row icon={Lock} label="Privacy & security" to="/settings/privacy" />

        <p className="px-4 pt-5 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Onchain</p>
        <Row icon={Wallet} label="Wallet" to="/wallet" />
        <Row icon={Wallet} label="Swap & bridge" to="/onchain" />

        <p className="px-4 pt-5 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Support</p>
        <Row icon={HelpCircle} label="Help center" onClick={() => toast.info("Coming soon")} />

        <div className="mt-8">
          <Row icon={LogOut} label="Sign out" onClick={handleSignOut} danger />
        </div>

        <p className="px-4 py-6 text-center text-[12px] text-muted-foreground">MEKU · v0.1</p>
      </nav>
    </AppShell>
  );
};

export default Settings;
