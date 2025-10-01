import { useMemo, useState } from "react";
import {
  Map as MapIcon,
  ShieldCheck,
  Sparkles,
  BarChart3,
  TreePine,
  Globe2,
} from "lucide-react";

import NetworkMap from "@/components/visuals/NetworkMap";
import SubsystemPanel from "@/components/visuals/SubsystemPanel";
import ProvenanceQuadrant from "@/components/visuals/ProvenanceQuadrant";
import BOMTree from "@/components/visuals/BOMTree";
import RegionalMetrics from "@/components/visuals/RegionalMetrics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SUBSYSTEMS,
  VENDOR_CLUSTERS,
  VENDORS,
  type SubsystemNode,
} from "@/data/provenance";

const execFlow = [
  "Coordinate turbine-wide provenance overlay",
  "Drill into subsystem signatures (Fan, Compressor, Combustor…)",
  "Surface exclusive vendor pathways before hand-off",
  "Launch diversification play directly from subsystem view",
];

const analystFlow = [
  "Start with BOM lineage tree for sourcing traceability",
  "Filter for single-source dependencies and shared vendors",
  "Prioritise quadrant actions to extend robustness",
  "Simulate regional diversification scenarios",
];

const Index = () => {
  const defaultSubsystemId: SubsystemNode["id"] = (
    SUBSYSTEMS.find((subsystem) => subsystem.id === "compressor") ??
    SUBSYSTEMS[0]
  ).id;

  const [selectedSubsystemId, setSelectedSubsystemId] =
    useState<SubsystemNode["id"]>(defaultSubsystemId);

  const vendorTouchpoints = useMemo(() => {
    const touchpointSet = new Map<string, Set<SubsystemNode["id"]>>();
    SUBSYSTEMS.forEach((subsystem) => {
      subsystem.components.forEach((component) => {
        component.relationships.forEach((relationship) => {
          if (!touchpointSet.has(relationship.vendorId)) {
            touchpointSet.set(relationship.vendorId, new Set());
          }
          touchpointSet.get(relationship.vendorId)!.add(subsystem.id);
        });
      });
    });

    const counts = new Map<string, number>();
    touchpointSet.forEach((set, vendorId) => {
      counts.set(vendorId, set.size);
    });

    return counts;
  }, []);

  const programAnalytics = useMemo(() => {
    let totalComponents = 0;
    let relationshipCount = 0;
    let exclusiveRelationships = 0;
    let minLead = Number.POSITIVE_INFINITY;
    let maxLead = 0;

    SUBSYSTEMS.forEach((subsystem) => {
      totalComponents += subsystem.components.length;
      subsystem.components.forEach((component) => {
        minLead = Math.min(minLead, component.leadTimeWeeks);
        maxLead = Math.max(maxLead, component.leadTimeWeeks);
        component.relationships.forEach((relationship) => {
          relationshipCount += 1;
          if (relationship.exclusivity === "single-source") {
            exclusiveRelationships += 1;
          }
        });
      });
    });

    const uniqueVendorCount = vendorTouchpoints.size;
    const pinchPointVendors = Array.from(vendorTouchpoints.values()).filter(
      (count) => count > 1,
    ).length;

    const exclusiveRatio =
      relationshipCount === 0
        ? 0
        : (exclusiveRelationships / relationshipCount) * 100;

    return {
      totalComponents,
      uniqueVendorCount,
      pinchPointVendors,
      exclusiveRatio,
      leadSpan: {
        min: minLead === Number.POSITIVE_INFINITY ? 0 : minLead,
        max: maxLead,
      },
    };
  }, [vendorTouchpoints]);

  const selectedSubsystem = useMemo(
    () =>
      SUBSYSTEMS.find((subsystem) => subsystem.id === selectedSubsystemId) ??
      SUBSYSTEMS[0],
    [selectedSubsystemId],
  );

  return (
    <div className="space-y-6 pb-20 lg:space-y-10">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[hsla(var(--card)_/_0.82)] px-6 py-8 md:px-12 md:py-14">
        <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-[hsla(var(--glow-primary)_/_0.22)] blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[hsla(var(--glow-secondary)_/_0.18)] blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <Badge className="w-fit rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.44em] text-foreground/70">
                Gas Turbine Program • Provenance
              </Badge>
              <h1 className="text-3xl font-display leading-tight text-foreground md:text-4xl lg:text-5xl">
                Supply Chain Provenance Control Tower
              </h1>
              <p className="max-w-3xl text-sm text-foreground/70 md:text-base lg:text-lg">
                Visualise the complete lineage from turbine subsystems down to
                component vendors. Align executive oversight with analyst
                workflows to expose exclusive pathways, understand geographic
                provenance, and prepare diversification plays before simulation.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-sm text-foreground/70">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <MapIcon className="h-5 w-5 text-foreground/60" />
                <span className="uppercase tracking-[0.34em]">
                  Global blueprint synced
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <ShieldCheck className="h-5 w-5 text-foreground/60" />
                <span className="uppercase tracking-[0.34em]">
                  Provenance verified
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] px-4 py-5 lg:px-5 lg:py-6">
              <p className="text-xs uppercase tracking-[0.38em] text-foreground/60">
                Subsystems orchestrated
              </p>
              <p className="mt-2 text-2xl font-display text-foreground lg:mt-3 lg:text-3xl">
                {SUBSYSTEMS.length}
              </p>
              <p className="text-xs text-foreground/55">
                Core assemblies monitored with provenance overlays.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] px-4 py-5 lg:px-5 lg:py-6">
              <p className="text-xs uppercase tracking-[0.38em] text-foreground/60">
                Vendors instrumented
              </p>
              <p className="mt-2 text-2xl font-display text-foreground lg:mt-3 lg:text-3xl">
                {programAnalytics.uniqueVendorCount}
              </p>
              <p className="text-xs text-foreground/55">
                Global suppliers with live lineage and scoring.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] px-4 py-5 lg:px-5 lg:py-6">
              <p className="text-xs uppercase tracking-[0.38em] text-foreground/60">
                Exclusive pathways
              </p>
              <p className="mt-2 text-2xl font-display text-foreground lg:mt-3 lg:text-3xl">
                {Math.round(programAnalytics.exclusiveRatio)}%
              </p>
              <p className="text-xs text-foreground/55">
                Relationships requiring pre-approved contingency.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] px-4 py-5 lg:px-5 lg:py-6">
              <p className="text-xs uppercase tracking-[0.38em] text-foreground/60">
                Lead time band
              </p>
              <p className="mt-2 text-2xl font-display text-foreground lg:mt-3 lg:text-3xl">
                {Math.round(programAnalytics.leadSpan.min)}–
                {Math.round(programAnalytics.leadSpan.max)} wks
              </p>
              <p className="text-xs text-foreground/55">
                Cycle envelope across tracked assemblies.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 lg:p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-foreground/55">
                Executive storyline
              </p>
              <h2 className="mt-2 text-xl font-display text-foreground lg:text-2xl">
                Overview → Drill → Decide
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground/70 lg:mt-4 lg:space-y-3">
                {execFlow.map((step) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[hsla(var(--glow-primary)_/_0.8)]" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 lg:p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-foreground/55">
                Analyst storyline
              </p>
              <h2 className="mt-2 text-xl font-display text-foreground lg:text-2xl">
                Trace → Filter → Prioritise
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground/70 lg:mt-4 lg:space-y-3">
                {analystFlow.map((step) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[hsla(var(--glow-secondary)_/_0.8)]" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button className="rounded-full border border-white/10 bg-white/10 px-6 py-2 text-xs uppercase tracking-[0.42em] text-foreground hover:bg-white/20">
              Export Vercel handoff package
            </Button>
            <div className="flex items-center gap-2 text-xs text-foreground/60">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">
                Handoff bundles include data mocks, Tailwind tokens, and
                interaction notes.
              </span>
              <span className="sm:hidden">
                Complete handoff packages available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Visualization Tabs */}
      <section>
        <Tabs defaultValue="network" className="w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-4 rounded-2xl border border-white/10 bg-white/[0.05] p-1">
              <TabsTrigger
                value="network"
                className="flex items-center gap-2 text-xs data-[state=active]:bg-white/10"
              >
                <MapIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Network Map</span>
                <span className="sm:hidden">Network</span>
              </TabsTrigger>
              <TabsTrigger
                value="quadrant"
                className="flex items-center gap-2 text-xs data-[state=active]:bg-white/10"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Quadrant</span>
                <span className="sm:hidden">Quad</span>
              </TabsTrigger>
              <TabsTrigger
                value="bom"
                className="flex items-center gap-2 text-xs data-[state=active]:bg-white/10"
              >
                <TreePine className="h-4 w-4" />
                <span className="hidden sm:inline">BOM Tree</span>
                <span className="sm:hidden">BOM</span>
              </TabsTrigger>
              <TabsTrigger
                value="regional"
                className="flex items-center gap-2 text-xs data-[state=active]:bg-white/10"
              >
                <Globe2 className="h-4 w-4" />
                <span className="hidden sm:inline">Regional</span>
                <span className="sm:hidden">Region</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="network" className="mt-6">
            <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr] lg:gap-6">
              <NetworkMap
                subsystems={SUBSYSTEMS}
                vendors={VENDORS}
                clusters={VENDOR_CLUSTERS}
                selectedSubsystemId={selectedSubsystemId}
                onSelect={setSelectedSubsystemId}
              />
              <SubsystemPanel
                subsystem={selectedSubsystem}
                vendors={VENDORS}
                vendorTouchpoints={vendorTouchpoints}
              />
            </div>
          </TabsContent>

          <TabsContent value="quadrant" className="mt-6">
            <ProvenanceQuadrant
              subsystems={SUBSYSTEMS}
              vendors={VENDORS}
              vendorTouchpoints={vendorTouchpoints}
            />
          </TabsContent>

          <TabsContent value="bom" className="mt-6">
            <BOMTree
              subsystems={SUBSYSTEMS}
              vendors={VENDORS}
              vendorTouchpoints={vendorTouchpoints}
            />
          </TabsContent>

          <TabsContent value="regional" className="mt-6">
            <RegionalMetrics
              subsystems={SUBSYSTEMS}
              vendors={VENDORS}
              clusters={VENDOR_CLUSTERS}
              vendorTouchpoints={vendorTouchpoints}
            />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Index;
