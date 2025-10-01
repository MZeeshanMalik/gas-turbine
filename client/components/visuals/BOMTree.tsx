import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Component,
  Layers,
  MapPin,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  SubsystemNode,
  VendorNode,
  ComponentNode,
} from "@/data/provenance";

const colorWithAlpha = (token: string, alpha = 1) =>
  `hsla(var(${token}) / ${alpha})`;

interface BOMTreeProps {
  subsystems: SubsystemNode[];
  vendors: VendorNode[];
  vendorTouchpoints: Map<string, number>;
}

interface TreeNode {
  id: string;
  name: string;
  type: "root" | "subsystem" | "component" | "vendor";
  level: number;
  children: TreeNode[];
  data?: {
    subsystem?: SubsystemNode;
    component?: ComponentNode;
    vendor?: VendorNode;
    relationship?: ComponentNode["relationships"][number];
  };
  summary?: {
    componentCount?: number;
    vendorCount?: number;
    exclusiveCount?: number;
    avgLeadTime?: number;
  };
}

const BOMTree = ({ subsystems, vendors, vendorTouchpoints }: BOMTreeProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(["root"]),
  );

  const vendorById = useMemo(
    () => new Map(vendors.map((vendor) => [vendor.id, vendor] as const)),
    [vendors],
  );

  const treeData = useMemo((): TreeNode => {
    // Calculate root summary
    const totalComponents = subsystems.reduce(
      (sum, s) => sum + s.components.length,
      0,
    );
    const totalVendors = new Set(
      subsystems.flatMap((s) =>
        s.components.flatMap((c) => c.relationships.map((r) => r.vendorId)),
      ),
    ).size;
    const totalExclusive = subsystems.reduce(
      (sum, s) =>
        sum +
        s.components.reduce(
          (compSum, c) =>
            compSum +
            c.relationships.filter((r) => r.exclusivity === "single-source")
              .length,
          0,
        ),
      0,
    );
    const avgLeadTime =
      totalComponents > 0
        ? subsystems.reduce(
            (sum, s) =>
              sum +
              s.components.reduce((compSum, c) => compSum + c.leadTimeWeeks, 0),
            0,
          ) / totalComponents
        : 0;

    const subsystemNodes: TreeNode[] = subsystems.map((subsystem) => {
      const componentNodes: TreeNode[] = subsystem.components.map(
        (component) => {
          const vendorNodes: TreeNode[] = component.relationships.map(
            (relationship) => {
              const vendor = vendorById.get(relationship.vendorId);
              return {
                id: `${component.id}-${relationship.vendorId}`,
                name: vendor?.shortName || relationship.vendorId,
                type: "vendor" as const,
                level: 3,
                children: [],
                data: { vendor, relationship },
              };
            },
          );

          return {
            id: component.id,
            name: component.name,
            type: "component" as const,
            level: 2,
            children: vendorNodes,
            data: { component },
            summary: {
              vendorCount: component.relationships.length,
              exclusiveCount: component.relationships.filter(
                (r) => r.exclusivity === "single-source",
              ).length,
            },
          };
        },
      );

      const subsystemVendors = new Set(
        subsystem.components.flatMap((c) =>
          c.relationships.map((r) => r.vendorId),
        ),
      );
      const subsystemExclusive = subsystem.components.reduce(
        (sum, c) =>
          sum +
          c.relationships.filter((r) => r.exclusivity === "single-source")
            .length,
        0,
      );
      const subsystemAvgLead =
        subsystem.components.length > 0
          ? subsystem.components.reduce((sum, c) => sum + c.leadTimeWeeks, 0) /
            subsystem.components.length
          : 0;

      return {
        id: subsystem.id,
        name: subsystem.name,
        type: "subsystem" as const,
        level: 1,
        children: componentNodes,
        data: { subsystem },
        summary: {
          componentCount: subsystem.components.length,
          vendorCount: subsystemVendors.size,
          exclusiveCount: subsystemExclusive,
          avgLeadTime: subsystemAvgLead,
        },
      };
    });

    return {
      id: "root",
      name: "Gas Turbine Assembly",
      type: "root" as const,
      level: 0,
      children: subsystemNodes,
      summary: {
        componentCount: totalComponents,
        vendorCount: totalVendors,
        exclusiveCount: totalExclusive,
        avgLeadTime,
      },
    };
  }, [subsystems, vendorById]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const traverse = (node: TreeNode) => {
      allIds.add(node.id);
      node.children.forEach(traverse);
    };
    traverse(treeData);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(["root"]));
  };

  const renderNode = (node: TreeNode): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const indentWidth = node.level * 24;

    const getNodeIcon = () => {
      switch (node.type) {
        case "root":
          return <Layers className="h-4 w-4" />;
        case "subsystem":
          return <Component className="h-4 w-4" />;
        case "component":
          return (
            <div className="h-4 w-4 rounded border border-white/20 bg-white/10" />
          );
        case "vendor":
          return <MapPin className="h-3 w-3" />;
      }
    };

    const getNodeColor = () => {
      if (node.type === "subsystem" && node.data?.subsystem) {
        return colorWithAlpha(node.data.subsystem.colorToken, 0.7);
      }
      return "hsla(var(--foreground) / 0.6)";
    };

    const getRiskIndicator = () => {
      if (node.type === "vendor" && node.data?.relationship) {
        const { exclusivity } = node.data.relationship;
        if (exclusivity === "single-source") {
          return (
            <div className="h-2 w-2 rounded-full bg-[hsla(var(--destructive)_/_0.8)]" />
          );
        }
      }
      if (
        node.type === "component" &&
        node.summary?.exclusiveCount &&
        node.summary.exclusiveCount > 0
      ) {
        return (
          <div className="h-2 w-2 rounded-full bg-[hsla(var(--warning)_/_0.8)]" />
        );
      }
      return null;
    };

    return (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "group flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:bg-white/[0.05]",
            node.type === "subsystem" && "bg-white/[0.03]",
            node.type === "component" && "hover:bg-white/[0.03]",
          )}
          style={{ marginLeft: `${indentWidth}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="flex h-5 w-5 items-center justify-center rounded border border-white/20 bg-white/[0.05] hover:bg-white/10"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="h-5 w-5" />
          )}

          <div style={{ color: getNodeColor() }}>{getNodeIcon()}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "truncate",
                  node.type === "root" && "text-lg font-display",
                  node.type === "subsystem" && "text-base font-semibold",
                  node.type === "component" && "text-sm font-medium",
                  node.type === "vendor" && "text-sm",
                )}
              >
                {node.name}
              </span>
              {getRiskIndicator()}
            </div>

            {/* Summary info */}
            {node.summary && (
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-foreground/55">
                {node.summary.componentCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Component className="h-3 w-3" />
                    {node.summary.componentCount} components
                  </span>
                )}
                {node.summary.vendorCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {node.summary.vendorCount} vendors
                  </span>
                )}
                {node.summary.exclusiveCount !== undefined &&
                  node.summary.exclusiveCount > 0 && (
                    <span className="flex items-center gap-1 text-[hsla(var(--warning)_/_0.8)]">
                      {node.summary.exclusiveCount} exclusive
                    </span>
                  )}
                {node.summary.avgLeadTime !== undefined && (
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    {node.summary.avgLeadTime.toFixed(1)} wks avg
                  </span>
                )}
              </div>
            )}

            {/* Vendor/Component specific details */}
            {node.type === "vendor" && node.data?.vendor && (
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-foreground/55">
                <span>{node.data.vendor.region}</span>
                <span>R: {node.data.vendor.reliabilityScore}%</span>
                <span>Q: {node.data.vendor.qualityScore}%</span>
                {node.data.relationship && (
                  <Badge
                    className={cn(
                      "text-[10px] px-2 py-0.5",
                      node.data.relationship.exclusivity === "single-source"
                        ? "border-[hsla(var(--destructive)_/_0.7)] bg-[hsla(var(--destructive)_/_0.15)]"
                        : "border-white/10 bg-white/5",
                    )}
                  >
                    {node.data.relationship.exclusivity}
                  </Badge>
                )}
              </div>
            )}

            {node.type === "component" && node.data?.component && (
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-foreground/55">
                <span>{node.data.component.tier}</span>
                <span>{node.data.component.origin}</span>
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {node.data.component.leadTimeWeeks} wks
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Render children */}
        {isExpanded && hasChildren && (
          <div className="border-l border-white/10 ml-6">
            {node.children.map(renderNode)}
          </div>
        )}
      </div>
    );
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
              Bill of Materials Hierarchy
            </p>
            <h2 className="text-2xl font-display text-foreground md:text-3xl">
              Component Lineage Tree
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={expandAll}
              variant="outline"
              size="sm"
              className="text-xs border-white/20 bg-white/5 hover:bg-white/10"
            >
              Expand All
            </Button>
            <Button
              onClick={collapseAll}
              variant="outline"
              size="sm"
              className="text-xs border-white/20 bg-white/5 hover:bg-white/10"
            >
              Collapse All
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 max-h-[600px] overflow-y-auto">
          {renderNode(treeData)}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/60">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsla(var(--destructive)_/_0.8)]" />
            <span>Single-source risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsla(var(--warning)_/_0.8)]" />
            <span>Component has exclusive vendors</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-3 w-3" />
            <span>Lead time indicators</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOMTree;
