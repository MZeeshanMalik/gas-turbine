import { Fragment, ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Workflow, Gauge, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Provenance Overview", icon: MapIcon },
  { to: "/simulations", label: "Scenario Lab", icon: Gauge },
  { to: "/playbooks", label: "Diversification Playbooks", icon: Workflow },
];

const LayoutChromaticRing = () => (
  <svg
    aria-hidden
    className="pointer-events-none absolute -top-28 right-[-120px] h-[360px] w-[360px] opacity-40"
    viewBox="0 0 400 400"
  >
    <defs>
      <radialGradient id="layout-ring" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="hsla(var(--glow-primary) / 0.4)" />
        <stop offset="55%" stopColor="hsla(var(--glow-secondary) / 0.15)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <circle cx="200" cy="200" r="180" fill="url(#layout-ring)" />
    <circle
      cx="200"
      cy="200"
      r="180"
      fill="none"
      stroke="hsla(var(--glow-primary) / 0.35)"
      strokeDasharray="12 18"
      strokeWidth="1.4"
    />
  </svg>
);

const AppShellHeader = ({ children }: { children: ReactNode }) => (
  <header className="relative z-40 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-[hsla(var(--card)_/_0.75)] px-4 py-3 backdrop-blur-xl md:gap-6 md:px-6 md:py-4 lg:px-10">
    {children}
  </header>
);

const BrandStack = () => (
  <div className="flex items-center gap-3 lg:gap-4">
    <div className="relative flex h-10 w-10 flex-none items-center justify-center rounded-2xl border border-white/20 bg-[hsla(var(--subsystem-connection)_/_0.25)] text-lg font-semibold text-foreground drop-shadow-glow lg:h-12 lg:w-12">
      <span className="text-xs font-display tracking-[0.22em] text-foreground/80 lg:text-sm">
        GT
      </span>
      <span className="absolute inset-0 -z-10 rounded-2xl border border-white/5 blur-[1px]" />
    </div>
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.48em] text-foreground/50 lg:text-[11px]">
        Vantage Provenance
      </p>
      <h1 className="text-lg font-display leading-tight text-foreground lg:text-xl">
        <span className="hidden sm:inline">Gas Turbine Supply Chain</span>
        <span className="sm:hidden">GT Supply Chain</span>
      </h1>
    </div>
  </div>
);

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="hidden items-center gap-2 md:flex">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group rounded-2xl border border-transparent px-3 py-2 text-xs font-medium text-foreground/70 transition-all lg:px-4 lg:text-sm",
                isActive || location.pathname === item.to
                  ? "border-white/20 bg-white/5 text-foreground drop-shadow-glow"
                  : "hover:border-white/10 hover:bg-white/[0.04] hover:text-foreground/90",
              )
            }
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">{item.label}</span>
              <span className="lg:hidden">{item.label.split(" ")[0]}</span>
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};

const HeaderCTAs = () => (
  <div className="flex flex-1 items-center justify-end gap-2">
    <Badge className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.28em] text-foreground/70 md:flex md:px-3 lg:text-[11px]">
      <Sparkles className="h-3 w-3" />
      <span className="hidden lg:inline">Live Data</span>
      <span className="lg:hidden">Live</span>
    </Badge>
    <Button
      variant="outline"
      className="rounded-full border-white/20 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.42em] text-foreground/80 hover:bg-white/10 md:px-4 lg:text-xs"
    >
      <span className="hidden sm:inline">Export Provenance</span>
      <span className="sm:hidden">Export</span>
    </Button>
  </div>
);

const AppLayout = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden pb-24">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[hsla(var(--glow-primary)_/_0.04)] to-[hsla(var(--glow-secondary)_/_0.1)]" />
      </div>
      <div className="relative z-10 flex flex-col gap-6 px-4 pt-6 md:gap-8 md:px-8 md:pt-8 lg:gap-10 lg:px-16">
        <div className="relative">
          <LayoutChromaticRing />
          <AppShellHeader>
            <BrandStack />
            <Navigation />
            <HeaderCTAs />
          </AppShellHeader>
        </div>
        <main className="relative mx-auto w-full max-w-[1440px] flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
