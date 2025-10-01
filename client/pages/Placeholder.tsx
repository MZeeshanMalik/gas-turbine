import { ReactNode } from "react";
import { ArrowRight, Compass, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaceholderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  callToAction?: string;
}

const Placeholder = ({ title, description, icon, callToAction }: PlaceholderProps) => {
  return (
    <div className="glass-panel relative overflow-hidden rounded-[32px] border border-white/10 p-10">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[hsla(var(--glow-primary)_/_0.08)] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-[hsla(var(--glow-secondary)_/_0.08)] blur-3xl" />
      <div className="relative flex flex-col gap-6">
        <div className="flex items-center gap-4 text-foreground/80">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary">
            {icon ?? <Compass className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-3xl font-display tracking-tight text-foreground">{title}</h2>
            <p className="mt-2 max-w-2xl text-base text-foreground/70">{description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60">
          <span className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 uppercase tracking-[0.32em]">
            <Workflow className="h-4 w-4" />
            Configure Next
          </span>
          {callToAction && (
            <Button variant="ghost" className="group gap-2 rounded-full border border-white/10 bg-white/5">
              {callToAction}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Placeholder;
