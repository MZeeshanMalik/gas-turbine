import { useMemo } from "react";
import { ArrowUpRight, Globe2, Layers, Network, Timer } from "lucide-react";

import type { SubsystemNode, VendorNode } from "@/data/provenance";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const colorWithAlpha = (token: string, alpha = 1) =>
  `hsla(var(${token}) / ${alpha})`;

interface SubsystemPanelProps {
  subsystem: SubsystemNode;
  vendors: VendorNode[];
  vendorTouchpoints: Map<string, number>;
}

const exclusivityCopy: Record<string, string> = {
  "single-source": "Exclusive partnership",
  preferred: "Preferred supply",
  "multi-source": "Diversified supply",
};

const SubsystemPanel = ({ subsystem, vendors, vendorTouchpoints }: SubsystemPanelProps) => {
  const vendorById = useMemo(
    () => new Map(vendors.map((vendor) => [vendor.id, vendor] as const)),
    [vendors],
  );

  const analytics = useMemo(() => {
    const vendorIds = new Set<string>();
    let exclusive = 0;
    let totalLead = 0;
    let minLead = Number.POSITIVE_INFINITY;
    let maxLead = 0;

    subsystem.components.forEach((component) => {
      totalLead += component.leadTimeWeeks;
      minLead = Math.min(minLead, component.leadTimeWeeks);
      maxLead = Math.max(maxLead, component.leadTimeWeeks);

      component.relationships.forEach((relationship) => {
        vendorIds.add(relationship.vendorId);
        if (relationship.exclusivity === "single-source") {
          exclusive += 1;
        }
      });
    });

    const relationshipCount = subsystem.components.reduce(
      (sum, component) => sum + component.relationships.length,
      0,
    );

    const exclusiveRatio = relationshipCount === 0 ? 0 : (exclusive / relationshipCount) * 100;

    const averageLead =
      subsystem.components.length === 0
        ? 0
        : totalLead / subsystem.components.length;

    const vendorRegions = Array.from(vendorIds)
      .map((vendorId) => vendorById.get(vendorId)?.region)
      .filter((region): region is VendorNode["region"] => Boolean(region));

    return {
      componentCount: subsystem.components.length,
      uniqueVendorCount: vendorIds.size,
      exclusiveRatio,
      averageLead,
      leadSpan: {
        min: minLead === Number.POSITIVE_INFINITY ? 0 : minLead,
        max: maxLead,
      },
      vendorIds,
      regionCount: new Set(vendorRegions).size,
    };
  }, [subsystem, vendorById]);

  const pinchVendors = useMemo(() => {
    return Array.from(analytics.vendorIds)
      .map((vendorId) => vendorById.get(vendorId))
      .filter((vendor): vendor is VendorNode => Boolean(vendor))
      .filter((vendor) => (vendorTouchpoints.get(vendor.id) ?? 0) > 1)
      .sort((a, b) => (vendorTouchpoints.get(b.id) ?? 0) - (vendorTouchpoints.get(a.id) ?? 0));
  }, [analytics.vendorIds, vendorById, vendorTouchpoints]);

  const metrics = [
    {
      label: "Components traced",
      value: analytics.componentCount.toString().padStart(2, "0"),
      icon: Layers,
      caption: "Assemblies with provenance linkage",
    },
    {
      label: "Vendors linked",
      value: analytics.uniqueVendorCount.toString().padStart(2, "0"),
      icon: Network,
      caption: "Active manufacturing partners",
    },
    {
      label: "Exclusive partnerships",
      value: `${Math.round(analytics.exclusiveRatio)}%`,
      icon: ArrowUpRight,
      caption: "Lineage agreements per component",
    },
    {
      label: "Lead time envelope",
      value: `${Math.round(analytics.leadSpan.min)}–${Math.round(analytics.leadSpan.max)} wks`,
      icon: Timer,
      caption: "Shortest vs longest cycle",
    },
    {
      label: "Regions engaged",
      value: analytics.regionCount.toString(),
      icon: Globe2,
      caption: "Geographic coverage",
    },
  ];

  return (
    <div className="glass-panel relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.06] to-transparent" />
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Badge className="w-fit rounded-full border border-white/15 bg-white/[0.08] px-4 py-1 text-[11px] uppercase tracking-[0.44em] text-foreground/70">
            {subsystem.name} provenance
          </Badge>
          <div className="flex flex-col gap-4">
            <h3 className="text-3xl font-display leading-tight text-foreground">
              {subsystem.summary}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.36em] text-foreground/55">
              <span className="rounded-full border border-white/10 px-3 py-1">
                {analytics.uniqueVendorCount} vendors
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Avg lead {analytics.averageLead.toFixed(1)} wks
              </span>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4"
              >
                <div className="flex items-center justify-between text-foreground/60">
                  <p className="text-[11px] font-mono uppercase tracking-[0.44em]">
                    {metric.label}
                  </p>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-2xl font-display text-foreground">{metric.value}</p>
                <p className="text-xs text-foreground/55">{metric.caption}</p>
              </div>
            );
          })}
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.32em] text-foreground/60">
            Component lineage
          </h4>
          <div className="mt-4 space-y-4">
            {subsystem.components.map((component) => {
              const strengthScore = component.relationships.reduce(
                (sum, relationship) => sum + relationship.strength,
                0,
              );
              const normalizedStrength =
                component.relationships.length === 0
                  ? 0
                  : (strengthScore / (component.relationships.length * 5)) * 100;

              return (
                <div
                  key={component.id}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
                        {component.tier}
                      </p>
                      <p className="text-lg font-display text-foreground">
                        {component.name}
                      </p>
                      <p className="text-xs text-foreground/60">
                        Origin: {component.origin} • Lead {component.leadTimeWeeks} wks
                      </p>
                    </div>
                    <Badge className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-foreground/65">
                      {component.relationships.length} vendors
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {component.relationships.map((relationship) => {
                      const vendor = vendorById.get(relationship.vendorId);
                      if (!vendor) return null;
                      const exclusivity = relationship.exclusivity;
                      const vendorDegree = vendorTouchpoints.get(vendor.id) ?? 1;
                      const pinch = vendorDegree > 1;
                      return (
                        <span
                          key={`${component.id}-${vendor.id}`}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1",
                            exclusivity === "single-source"
                              ? "border-[hsla(var(--destructive)_/_0.7)] bg-[hsla(var(--destructive)_/_0.18)] text-foreground"
                              : "border-white/10 bg-white/[0.06] text-foreground/80",
                          )}
                        >
                          <span className="font-medium">{vendor.shortName}</span>
                          <span className="text-foreground/60">{vendor.region}</span>
                          <span className="text-foreground/50">
                            {exclusivityCopy[exclusivity]}
                          </span>
                          {pinch && (
                            <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.28em] text-foreground/60">
                              {vendorDegree} subsystems
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${normalizedStrength}%`,
                        background: `linear-gradient(90deg, ${colorWithAlpha(subsystem.colorToken, 0.95)}, ${colorWithAlpha(subsystem.connectionToken, 0.65)})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-[0.32em] text-foreground/60">
              Shared vendor pinch points
            </h4>
            <Badge className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-foreground/65">
              Network overlap
            </Badge>
          </div>
          {pinchVendors.length > 0 ? (
            <div className="mt-4 space-y-3">
              {pinchVendors.map((vendor) => {
                const touchpoints = vendorTouchpoints.get(vendor.id) ?? 0;
                return (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{vendor.name}</p>
                      <p className="text-xs text-foreground/55">
                        {vendor.region} • {vendor.primaryLocation}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] uppercase tracking-[0.32em] text-foreground/55">
                        {touchpoints} subsystems
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.08] px-2 py-1 text-[10px] uppercase tracking-[0.32em] text-foreground/65">
                        Monitor
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-foreground/55">
              All vendors serving this subsystem are currently unique to its assemblies.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubsystemPanel;
