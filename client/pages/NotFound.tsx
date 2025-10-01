import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="glass-panel relative overflow-hidden rounded-[32px] border border-white/10 px-10 py-14">
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-[hsla(var(--glow-primary)_/_0.18)] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-[hsla(var(--glow-secondary)_/_0.18)] blur-3xl" />
      <div className="relative z-10 flex flex-col items-start gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">Navigation anomaly</p>
            <h1 className="text-4xl font-display text-foreground">404 — Route not instrumented</h1>
          </div>
        </div>
        <p className="max-w-xl text-sm text-foreground/65">
          The requested path
          <span className="mx-2 rounded-full border border-white/10 px-2 py-0.5 text-xs uppercase tracking-[0.32em] text-foreground/80">
            {location.pathname}
          </span>
          is not part of the provenance workspace yet.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/70">
          <Link
            to="/"
            className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.42em] transition hover:bg-white/20"
          >
            Return to overview
          </Link>
          <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.36em] text-foreground/60">
            Request route build-out in chat
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
