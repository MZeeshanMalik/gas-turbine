import { useMemo } from "react";
import {
  BarChart3,
  Globe,
  MapPin,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  SubsystemNode,
  VendorNode,
  VendorCluster,
} from "@/data/provenance";

const colorWithAlpha = (token: string, alpha = 1) =>
  `hsla(var(${token}) / ${alpha})`;

interface RegionalMetricsProps {
  subsystems: SubsystemNode[];
  vendors: VendorNode[];
  clusters: VendorCluster[];
  vendorTouchpoints: Map<string, number>;
}

interface RegionalData {
  region: VendorNode["region"];
  cluster: VendorCluster;
  vendors: VendorNode[];
  metrics: {
    vendorCount: number;
    avgReliability: number;
    avgQuality: number;
    componentCount: number;
    exclusiveCount: number;
    pinchPointCount: number;
    leadTimeAvg: number;
    marketShare: number;
  };
  trend: "up" | "down" | "stable";
  risk: "low" | "medium" | "high";
}

const RegionalMetrics = ({
  subsystems,
  vendors,
  clusters,
  vendorTouchpoints,
}: RegionalMetricsProps) => {
  const regionalData = useMemo((): RegionalData[] => {
    const regions = new Map<VendorNode["region"], RegionalData>();

    // Initialize regions
    clusters.forEach((cluster) => {
      const regionVendors = vendors.filter((v) => v.region === cluster.region);
      const totalComponents = subsystems.reduce((sum, subsystem) => {
        return (
          sum +
          subsystem.components.reduce((compSum, component) => {
            return (
              compSum +
              component.relationships.filter((rel) => {
                const vendor = vendors.find((v) => v.id === rel.vendorId);
                return vendor?.region === cluster.region;
              }).length
            );
          }, 0)
        );
      }, 0);

      const exclusiveComponents = subsystems.reduce((sum, subsystem) => {
        return (
          sum +
          subsystem.components.reduce((compSum, component) => {
            return (
              compSum +
              component.relationships.filter((rel) => {
                const vendor = vendors.find((v) => v.id === rel.vendorId);
                return (
                  vendor?.region === cluster.region &&
                  rel.exclusivity === "single-source"
                );
              }).length
            );
          }, 0)
        );
      }, 0);

      const regionLeadTimes: number[] = [];
      subsystems.forEach((subsystem) => {
        subsystem.components.forEach((component) => {
          component.relationships.forEach((rel) => {
            const vendor = vendors.find((v) => v.id === rel.vendorId);
            if (vendor?.region === cluster.region) {
              regionLeadTimes.push(component.leadTimeWeeks);
            }
          });
        });
      });

      const pinchPointCount = regionVendors.filter(
        (vendor) => (vendorTouchpoints.get(vendor.id) || 0) > 1,
      ).length;

      const avgReliability =
        regionVendors.length > 0
          ? regionVendors.reduce((sum, v) => sum + v.reliabilityScore, 0) /
            regionVendors.length
          : 0;

      const avgQuality =
        regionVendors.length > 0
          ? regionVendors.reduce((sum, v) => sum + v.qualityScore, 0) /
            regionVendors.length
          : 0;

      const leadTimeAvg =
        regionLeadTimes.length > 0
          ? regionLeadTimes.reduce((sum, lt) => sum + lt, 0) /
            regionLeadTimes.length
          : 0;

      const totalGlobalComponents = subsystems.reduce((sum, subsystem) => {
        return (
          sum +
          subsystem.components.reduce((compSum, component) => {
            return compSum + component.relationships.length;
          }, 0)
        );
      }, 0);

      const marketShare =
        totalGlobalComponents > 0
          ? (totalComponents / totalGlobalComponents) * 100
          : 0;

      // Determine trend (simplified logic based on reliability and pinch points)
      let trend: "up" | "down" | "stable" = "stable";
      if (avgReliability > 88 && pinchPointCount < 2) {
        trend = "up";
      } else if (avgReliability < 80 || pinchPointCount > 3) {
        trend = "down";
      }

      // Determine risk
      let risk: "low" | "medium" | "high" = "low";
      if (exclusiveComponents > 2 || avgReliability < 80) {
        risk = "high";
      } else if (exclusiveComponents > 0 || pinchPointCount > 2) {
        risk = "medium";
      }

      regions.set(cluster.region, {
        region: cluster.region,
        cluster,
        vendors: regionVendors,
        metrics: {
          vendorCount: regionVendors.length,
          avgReliability,
          avgQuality,
          componentCount: totalComponents,
          exclusiveCount: exclusiveComponents,
          pinchPointCount,
          leadTimeAvg,
          marketShare,
        },
        trend,
        risk,
      });
    });

    return Array.from(regions.values()).sort(
      (a, b) => b.metrics.marketShare - a.metrics.marketShare,
    );
  }, [subsystems, vendors, clusters, vendorTouchpoints]);

  const globalMetrics = useMemo(() => {
    const totalVendors = vendors.length;
    const totalComponents = subsystems.reduce((sum, subsystem) => {
      return (
        sum +
        subsystem.components.reduce((compSum, component) => {
          return compSum + component.relationships.length;
        }, 0)
      );
    }, 0);

    const avgReliability =
      vendors.length > 0
        ? vendors.reduce((sum, v) => sum + v.reliabilityScore, 0) /
          vendors.length
        : 0;

    const avgQuality =
      vendors.length > 0
        ? vendors.reduce((sum, v) => sum + v.qualityScore, 0) / vendors.length
        : 0;

    return {
      totalVendors,
      totalComponents,
      avgReliability,
      avgQuality,
    };
  }, [subsystems, vendors]);

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

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return (
          <TrendingUp className="h-4 w-4 text-[hsla(var(--success)_/_0.8)]" />
        );
      case "down":
        return (
          <TrendingDown className="h-4 w-4 text-[hsla(var(--destructive)_/_0.8)]" />
        );
      case "stable":
        return <BarChart3 className="h-4 w-4 text-foreground/60" />;
    }
  };

  return (
    <div className="glass-panel relative overflow-hidden rounded-[28px] border border-white/10 bg-[hsla(var(--card)_/_0.78)] shadow-floating">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="blueprint-grid absolute inset-0" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.48em] text-foreground/50">
              Geographic Distribution Analysis
            </p>
            <h2 className="text-2xl font-display text-foreground md:text-3xl">
              Regional Performance Metrics
            </h2>
          </div>
          <Badge className="w-fit rounded-full border border-white/15 bg-white/[0.08] px-4 py-1 text-[11px] uppercase tracking-[0.44em] text-foreground/70">
            Global Coverage
          </Badge>
        </div>

        {/* Global Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4">
            <div className="flex items-center justify-between text-foreground/60">
              <p className="text-[11px] font-mono uppercase tracking-[0.44em]">
                Global Vendors
              </p>
              <Globe className="h-4 w-4" />
            </div>
            <p className="mt-2 text-2xl font-display text-foreground">
              {globalMetrics.totalVendors}
            </p>
            <p className="text-xs text-foreground/55">
              Across {regionalData.length} regions
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4">
            <div className="flex items-center justify-between text-foreground/60">
              <p className="text-[11px] font-mono uppercase tracking-[0.44em]">
                Component Links
              </p>
              <MapPin className="h-4 w-4" />
            </div>
            <p className="mt-2 text-2xl font-display text-foreground">
              {globalMetrics.totalComponents}
            </p>
            <p className="text-xs text-foreground/55">
              Total vendor relationships
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4">
            <div className="flex items-center justify-between text-foreground/60">
              <p className="text-[11px] font-mono uppercase tracking-[0.44em]">
                Avg Reliability
              </p>
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="mt-2 text-2xl font-display text-foreground">
              {globalMetrics.avgReliability.toFixed(1)}%
            </p>
            <p className="text-xs text-foreground/55">
              Weighted global average
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4">
            <div className="flex items-center justify-between text-foreground/60">
              <p className="text-[11px] font-mono uppercase tracking-[0.44em]">
                Avg Quality
              </p>
              <BarChart3 className="h-4 w-4" />
            </div>
            <p className="mt-2 text-2xl font-display text-foreground">
              {globalMetrics.avgQuality.toFixed(1)}%
            </p>
            <p className="text-xs text-foreground/55">Quality score average</p>
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-display text-foreground">
            Regional Breakdown
          </h3>

          <div className="grid gap-4 lg:grid-cols-2">
            {regionalData.map((region) => (
              <div
                key={region.region}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold text-foreground">
                        {region.region}
                      </h4>
                      {getTrendIcon(region.trend)}
                    </div>
                    <p className="text-sm text-foreground/60 mt-1">
                      {region.cluster.commentary}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      className={cn(
                        "rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.32em]",
                        region.risk === "high" &&
                          "border-[hsla(var(--destructive)_/_0.7)] bg-[hsla(var(--destructive)_/_0.15)] text-foreground",
                        region.risk === "medium" &&
                          "border-[hsla(var(--warning)_/_0.7)] bg-[hsla(var(--warning)_/_0.15)] text-foreground",
                        region.risk === "low" &&
                          "border-[hsla(var(--success)_/_0.7)] bg-[hsla(var(--success)_/_0.15)] text-foreground",
                      )}
                    >
                      {region.risk} risk
                    </Badge>
                    <div className="text-right">
                      <p className="text-lg font-display text-foreground">
                        {region.metrics.marketShare.toFixed(1)}%
                      </p>
                      <p className="text-xs text-foreground/55">Market share</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Vendors</span>
                      <span className="font-mono text-foreground">
                        {region.metrics.vendorCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Components</span>
                      <span className="font-mono text-foreground">
                        {region.metrics.componentCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Exclusive</span>
                      <span
                        className={cn(
                          "font-mono",
                          region.metrics.exclusiveCount > 0
                            ? "text-[hsla(var(--warning)_/_0.8)]"
                            : "text-foreground",
                        )}
                      >
                        {region.metrics.exclusiveCount}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Reliability</span>
                      <span className="font-mono text-foreground">
                        {region.metrics.avgReliability.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Quality</span>
                      <span className="font-mono text-foreground">
                        {region.metrics.avgQuality.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Lead Time</span>
                      <span className="font-mono text-foreground">
                        {region.metrics.leadTimeAvg.toFixed(1)} wks
                      </span>
                    </div>
                  </div>
                </div>

                {region.metrics.pinchPointCount > 0 && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground/60">
                        Pinch Point Vendors
                      </span>
                      <Badge className="bg-[hsla(var(--warning)_/_0.15)] border-[hsla(var(--warning)_/_0.5)] text-[10px] px-2 py-0.5">
                        {region.metrics.pinchPointCount} vendors
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Market share visualization */}
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${region.metrics.marketShare}%`,
                        backgroundColor: getRiskColor(region.risk),
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h4 className="text-sm font-semibold uppercase tracking-[0.32em] text-foreground/60 mb-4">
            Key Regional Insights
          </h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="text-sm">
              <p className="text-foreground font-medium">
                Highest Risk Region:
              </p>
              <p className="text-foreground/70">
                {regionalData.find((r) => r.risk === "high")?.region ||
                  "None identified"}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-foreground font-medium">Most Diversified:</p>
              <p className="text-foreground/70">
                {
                  regionalData.reduce((max, curr) =>
                    curr.metrics.vendorCount > max.metrics.vendorCount
                      ? curr
                      : max,
                  ).region
                }
              </p>
            </div>
            <div className="text-sm">
              <p className="text-foreground font-medium">Fastest Lead Times:</p>
              <p className="text-foreground/70">
                {
                  regionalData.reduce((min, curr) =>
                    curr.metrics.leadTimeAvg < min.metrics.leadTimeAvg
                      ? curr
                      : min,
                  ).region
                }
              </p>
            </div>
            <div className="text-sm">
              <p className="text-foreground font-medium">Quality Leader:</p>
              <p className="text-foreground/70">
                {
                  regionalData.reduce((max, curr) =>
                    curr.metrics.avgQuality > max.metrics.avgQuality
                      ? curr
                      : max,
                  ).region
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionalMetrics;
