import { AppShell } from "@/components/meku/AppShell";
import { ChevronLeft, Lock, Eye, UserX, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const Privacy = () => {
  const navigate = useNavigate();
  const [priv, setPriv] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [dms, setDms] = useState(true);

  return (
    <AppShell hideNav>
      <header className="sticky top-0 z-30 flex h-[56px] items-center bg-background/90 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.7} />
        </button>
        <h1 className="text-[16px] font-bold">Privacy & Security</h1>
      </header>

      <section className="px-5 pt-4 space-y-4">
        <ToggleRow icon={Lock} title="Private account" desc="Only approved followers can see your posts." checked={priv} onChange={setPriv} />
        <ToggleRow icon={Eye} title="Activity status" desc="Show when you're active." checked={showActivity} onChange={setShowActivity} />
        <ToggleRow icon={UserX} title="Allow DMs from anyone" desc="Turn off to limit to your follows." checked={dms} onChange={setDms} />

        <div className="rounded-[16px] border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-[18px] w-[18px] text-primary" strokeWidth={1.8} />
            <div>
              <p className="text-[15px] font-semibold text-foreground">Two-factor authentication</p>
              <p className="text-[13px] text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
          </div>
          <button className="tap mt-3 w-full rounded-full border border-border py-[10px] text-[13px] font-semibold text-foreground">
            Set up 2FA
          </button>
        </div>

        <p className="px-1 pt-2 text-[12px] text-muted-foreground">
          These settings are stored locally. Server-side enforcement will be wired in the next iteration.
        </p>
      </section>
    </AppShell>
  );
};

const ToggleRow = ({ icon: Icon, title, desc, checked, onChange }: any) => (
  <div className="flex items-center gap-3 rounded-[16px] border border-border bg-surface p-4">
    <span className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-full bg-surface-2 text-primary">
      <Icon className="h-[16px] w-[16px]" strokeWidth={1.8} />
    </span>
    <div className="flex-1">
      <p className="text-[15px] font-semibold text-foreground">{title}</p>
      <p className="text-[12px] text-muted-foreground">{desc}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default Privacy;
