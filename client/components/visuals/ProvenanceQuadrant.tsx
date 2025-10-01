import { useMemo } from "react";
import { AlertTriangle, CheckCircle, Clock, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SubsystemNode, VendorNode } from "@/data/provenance";

const colorWithAlpha = (token: string, alpha = 1) =>
  `hsla(var(${token}) / ${alpha})`;

interface ProvenanceQuadrantProps {
  subsystems: SubsystemNode[];
  vendors: VendorNode[];
  vendorTouchpoints: Map<string, number>;
}

interface QuadrantData {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof CheckCircle;
  items: Array<{
    id: string;
    name: string;
    value: string;
    risk: "low" | "medium" | "high";
    details: string;
  }>;
  colorToken: string;
  risk: "low" | "medium" | "high";
}

const ProvenanceQuadrant = ({
  subsystems,
  vendors,
  vendorTouchpoints,
}: ProvenanceQuadrantProps) => {
  const quadrantData = useMemo((): QuadrantData[] => {
    // Calculate analytics for each quadrant
    const exclusiveRelationships = new Map<string, number>();
    const componentsByTier = new Map<string, number>();
    const leadTimeRisks: Array<{ name: string; weeks: number; tier: string }> =
      [];
    const criticalVendors: Array<{
      vendor: VendorNode;
      subsystemCount: number;
      score: number;
    }> = [];

    // Process subsystems for analytics
    subsystems.forEach((subsystem) => {
      subsystem.components.forEach((component) => {
        // Count components by tier
        const tierCount = componentsByTier.get(component.tier) || 0;
        componentsByTier.set(component.tier, tierCount + 1);

        // Track lead time risks
        if (component.leadTimeWeeks >= 18) {
          leadTimeRisks.push({
            name: component.name,
            weeks: component.leadTimeWeeks,
            tier: component.tier,
          });
        }

        // Count exclusive relationships by subsystem
        component.relationships.forEach((rel) => {
          if (rel.exclusivity === "single-source") {
            const count = exclusiveRelationships.get(subsystem.id) || 0;
            exclusiveRelationships.set(subsystem.id, count + 1);
          }
        });
      });
    });

    // Process critical vendors
    vendors.forEach((vendor) => {
      const touchpointCount = vendorTouchpoints.get(vendor.id) || 0;
      if (touchpointCount > 1) {
        const avgScore = (vendor.reliabilityScore + vendor.qualityScore) / 2;
        criticalVendors.push({
          vendor,
          subsystemCount: touchpointCount,
          score: avgScore,
        });
      }
    });

    // Sort arrays
    leadTimeRisks.sort((a, b) => b.weeks - a.weeks);
    criticalVendors.sort((a, b) => b.subsystemCount - a.subsystemCount);

    return [
      {
        id: "reliability",
        title: "Reliability Matrix",
        subtitle: "Vendor performance & dependencies",
        icon: CheckCircle,
        colorToken: "--subsystem-fan",
        risk: criticalVendors.some((cv) => cv.score < 85) ? "high" : "medium",
        items: criticalVendors.slice(0, 4).map((cv) => ({
          id: cv.vendor.id,
          name: cv.vendor.shortName,
          value: `${cv.score.toFixed(0)}%`,
          risk: cv.score >= 90 ? "low" : cv.score >= 80 ? "medium" : "high",
          details: `${cv.subsystemCount} subsystems • ${cv.vendor.region}`,
        })),
      },
      {
        id: "exclusivity",
        title: "Exclusivity Risk",
        subtitle: "Single-source dependencies",
        icon: AlertTriangle,
        colorToken: "--subsystem-combustor",
        risk: Array.from(exclusiveRelationships.values()).some(
          (count) => count >= 2,
        )
          ? "high"
          : "medium",
        items: Array.from(exclusiveRelationships.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([subsystemId, count]) => {
            const subsystem = subsystems.find((s) => s.id === subsystemId);
            return {
              id: subsystemId,
              name: subsystem?.name || subsystemId,
              value: `${count} exclusive`,
              risk: count >= 3 ? "high" : count >= 2 ? "medium" : "low",
              details: `${subsystem?.components.length || 0} total components`,
            };
          }),
      },
      {
        id: "leadtime",
        title: "Lead Time Envelope",
        subtitle: "Manufacturing cycle risks",
        icon: Clock,
        colorToken: "--subsystem-turbine",
        risk: leadTimeRisks.some((ltr) => ltr.weeks >= 22) ? "high" : "medium",
        items: leadTimeRisks.slice(0, 4).map((ltr) => ({
          id: ltr.name.replace(/\s+/g, "-").toLowerCase(),
          name: ltr.name,
          value: `${ltr.weeks} wks`,
          risk: ltr.weeks >= 22 ? "high" : ltr.weeks >= 16 ? "medium" : "low",
          details: `${ltr.tier} • Extended manufacturing`,
        })),
      },
      {
        id: "diversification",
        title: "Diversification Index",
        subtitle: "Geographic & supplier spread",
        icon: Network,
        colorToken: "--subsystem-compressor",
        risk: "low",
        items: Array.from(componentsByTier.entries()).map(([tier, count]) => ({
          id: tier.replace(/\s+/g, "-").toLowerCase(),
          name: tier,
          value: `${count} components`,
          risk: tier === "OEM" ? "medium" : "low",
          details: `${Math.round((count / subsystems.reduce((sum, s) => sum + s.components.length, 0)) * 100)}% of total`,
        })),
      },
    ];
  }, [subsystems, vendors, vendorTouchpoints]);

  const getRiskColor = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "high":
        return "hsla(var(--destructive) / 0.8)";
      case "medium":
        return "hsla(var(--warning) / 0.8)";
      case "low":
        return "hsla(var(--success) / 0.8)";
    }
  };

  const getRiskBadgeStyle = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "high":
        return "border-[hsla(var(--destructive)_/_0.7)] bg-[hsla(var(--destructive)_/_0.15)] text-foreground";
      case "medium":
        return "border-[hsla(var(--warning)_/_0.7)] bg-[hsla(var(--warning)_/_0.15)] text-foreground";
      case "low":
        return "border-[hsla(var(--success)_/_0.7)] bg-[hsla(var(--success)_/_0.15)] text-foreground";
    }
  };

  return (
    <div className="glass-panel relative overflow-hidden rounded-[28px] border border-white/10 bg-[hsla(var(--card)_/_0.78)] p-6 shadow-floating">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="blueprint-grid absolute inset-0" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.48em] text-foreground/50">
              Provenance Risk Assessment
            </p>
            <h2 className="text-2xl font-display text-foreground md:text-3xl">
              Supply Chain Quadrant Analysis
            </h2>
          </div>
          <Badge className="w-fit rounded-full border border-white/15 bg-white/[0.08] px-4 py-1 text-[11px] uppercase tracking-[0.44em] text-foreground/70">
            Real-time Monitoring
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
          {quadrantData.map((quadrant) => {
            const Icon = quadrant.icon;
            return (
              <div
                key={quadrant.id}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-lg border border-white/20 p-2"
                      style={{
                        backgroundColor: colorWithAlpha(
                          quadrant.colorToken,
                          0.15,
                        ),
                        borderColor: colorWithAlpha(quadrant.colorToken, 0.3),
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{
                          color: colorWithAlpha(quadrant.colorToken, 0.9),
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-display text-foreground">
                        {quadrant.title}
                      </h3>
                      <p className="text-xs text-foreground/60">
                        {quadrant.subtitle}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.32em]",
                      getRiskBadgeStyle(quadrant.risk),
                    )}
                  >
                    {quadrant.risk} risk
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {quadrant.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: getRiskColor(item.risk) }}
                          />
                        </div>
                        <p className="text-xs text-foreground/55 truncate">
                          {item.details}
                        </p>
                      </div>
                      <div className="text-sm font-mono text-foreground">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {quadrant.items.length === 0 && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center">
                    <p className="text-sm text-foreground/55">
                      No critical items identified in this quadrant
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProvenanceQuadrant;
