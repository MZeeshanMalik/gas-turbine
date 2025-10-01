import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import type {
  ComponentNode,
  SubsystemNode,
  VendorCluster,
  VendorNode,
} from "@/data/provenance";

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 420;
const MARGIN_X = 80;
const CORE_SPINE_Y = 210;
const CORE_SPINE_HEIGHT = 120;

const scaleX = (value: number) =>
  MARGIN_X + ((VIEWBOX_WIDTH - MARGIN_X * 2) * value) / 100;

const scaleY = (value: number) => (VIEWBOX_HEIGHT * value) / 100;

const colorWithAlpha = (token: string, alpha = 1) =>
  `hsla(var(${token}) / ${alpha})`;

type Edge = {
  subsystemId: SubsystemNode["id"];
  vendorId: VendorNode["id"];
  componentId: ComponentNode["id"];
  strength: number;
  exclusivity: ComponentNode["relationships"][number]["exclusivity"];
};

type NetworkMapProps = {
  subsystems: SubsystemNode[];
  vendors: VendorNode[];
  clusters: VendorCluster[];
  selectedSubsystemId: SubsystemNode["id"];
  onSelect: (id: SubsystemNode["id"]) => void;
};

const NetworkMap = memo(
  ({
    subsystems,
    vendors,
    clusters,
    selectedSubsystemId,
    onSelect,
  }: NetworkMapProps) => {
    const selectedSubsystem =
      subsystems.find((subsystem) => subsystem.id === selectedSubsystemId) ??
      subsystems[0];

    const subsystemById = useMemo(
      () => new Map(subsystems.map((subsystem) => [subsystem.id, subsystem] as const)),
      [subsystems],
    );

    const subsystemPositions = useMemo(() => {
      return new Map(
        subsystems.map((subsystem) => {
          const startX = scaleX(subsystem.geometry.start);
          const endX = scaleX(subsystem.geometry.end);
          const width = endX - startX;
          const centerX = startX + width / 2;
          return [subsystem.id, { startX, endX, width, centerX }];
        }),
      );
    }, [subsystems]);

    const clusterById = useMemo(() => {
      return new Map(clusters.map((cluster) => [cluster.id, cluster] as const));
    }, [clusters]);

    const vendorSubsystemSet = useMemo(() => {
      const map = new Map<string, Set<SubsystemNode["id"]>>();
      subsystems.forEach((subsystem) => {
        subsystem.components.forEach((component) => {
          component.relationships.forEach((relationship) => {
            if (!map.has(relationship.vendorId)) {
              map.set(relationship.vendorId, new Set());
            }
            map.get(relationship.vendorId)!.add(subsystem.id);
          });
        });
      });
      return map;
    }, [subsystems]);

    const edges = useMemo<Edge[]>(() => {
      const result: Edge[] = [];
      subsystems.forEach((subsystem) => {
        subsystem.components.forEach((component) => {
          component.relationships.forEach((relationship) => {
            result.push({
              subsystemId: subsystem.id,
              vendorId: relationship.vendorId,
              componentId: component.id,
              strength: relationship.strength,
              exclusivity: relationship.exclusivity,
            });
          });
        });
      });
      return result;
    }, [subsystems]);

    const vendorPositions = useMemo(() => {
      const grouped = new Map<string, VendorNode[]>();
      vendors.forEach((vendor) => {
        if (!grouped.has(vendor.clusterId)) {
          grouped.set(vendor.clusterId, []);
        }
        grouped.get(vendor.clusterId)!.push(vendor);
      });

      const positions = new Map<
        string,
        {
          x: number;
          y: number;
          cluster: VendorCluster;
          vendor: VendorNode;
        }
      >();

      grouped.forEach((group, clusterId) => {
        const cluster = clusterById.get(clusterId);
        if (!cluster) return;
        const baseX = scaleX(cluster.coordinates.x);
        const baseY = scaleY(cluster.coordinates.y);

        const offsets = group.map((_, index) => {
          const column = index % 2;
          const row = Math.floor(index / 2);
          const horizontalShift = column === 0 ? -22 : 22;
          const verticalSpacing = 34;
          const direction = cluster.orientation === "top" ? 1 : -1;
          return {
            dx: horizontalShift,
            dy:
              direction * (32 + row * verticalSpacing) *
              (cluster.orientation === "top" ? 1 : -1),
          };
        });

        group.forEach((vendor, index) => {
          const offset = offsets[index];
          positions.set(vendor.id, {
            vendor,
            cluster,
            x: baseX + offset.dx,
            y: baseY + offset.dy,
          });
        });
      });

      return positions;
    }, [vendors, clusterById]);

    const defaultConnectionColor = colorWithAlpha("--subsystem-connection", 0.35);

    const createConnectionPath = (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      orientation: "top" | "bottom",
    ) => {
      const curvature = Math.max(120, Math.abs(startX - endX) * 0.45);
      const controlY1 =
        orientation === "top" ? startY - curvature : startY + curvature;
      const controlY2 =
        orientation === "top" ? endY + 60 : endY - 60;

      return `M ${startX.toFixed(2)} ${startY.toFixed(
        2,
      )} C ${startX.toFixed(2)} ${controlY1.toFixed(2)}, ${endX.toFixed(
        2,
      )} ${controlY2.toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`;
    };

    return (
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[hsla(var(--card)_/_0.78)] shadow-floating">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="blueprint-grid absolute inset-0" />
        </div>
        <div className="relative z-10 flex flex-col gap-6 px-6 pt-6 md:px-10 md:pt-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.48em] text-foreground/50">
                Component → Vendor Net Map
              </p>
              <h2 className="text-2xl font-display text-foreground md:text-3xl">
                Supply Chain Provenance Blueprint
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 uppercase tracking-[0.42em]">
                Thickness = Strength
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 uppercase tracking-[0.42em]">
                Red = Single Source
              </span>
            </div>
          </div>
          <div className="relative">
            <svg
              viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
              className="h-[360px] w-full"
              role="presentation"
            >
              <rect
                x={MARGIN_X - 40}
                y={CORE_SPINE_Y - CORE_SPINE_HEIGHT / 2 - 18}
                width={VIEWBOX_WIDTH - (MARGIN_X - 40) * 2}
                height={CORE_SPINE_HEIGHT + 36}
                rx={48}
                fill="hsla(var(--card) / 0.55)"
                stroke="hsla(var(--grid-line) / 0.35)"
                strokeWidth={1.2}
              />
              {subsystems.map((subsystem) => {
                const position = subsystemPositions.get(subsystem.id);
                if (!position) return null;
                const isSelected = subsystem.id === selectedSubsystem.id;
                const fill = colorWithAlpha(
                  subsystem.colorToken,
                  isSelected ? 0.78 : 0.32,
                );
                const stroke = colorWithAlpha(
                  subsystem.colorToken,
                  isSelected ? 0.95 : 0.55,
                );
                const startY = CORE_SPINE_Y - CORE_SPINE_HEIGHT / 2 + 12;
                return (
                  <g key={subsystem.id}>
                    <rect
                      x={position.startX}
                      y={startY}
                      width={position.width}
                      height={CORE_SPINE_HEIGHT - 24}
                      rx={36}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isSelected ? 2.6 : 1.4}
                      className="transition-all duration-300 ease-out"
                      onClick={() => onSelect(subsystem.id)}
                      style={{ cursor: "pointer" }}
                    />
                    <text
                      x={position.centerX}
                      y={CORE_SPINE_Y + 6}
                      textAnchor="middle"
                      className="font-display"
                      fill="hsla(var(--foreground) / 0.88)"
                      fontSize={isSelected ? 22 : 18}
                    >
                      {subsystem.name}
                    </text>
                  </g>
                );
              })}

              {clusters.map((cluster) => {
                const { x: clusterX, y: clusterY } = {
                  x: scaleX(cluster.coordinates.x),
                  y: scaleY(cluster.coordinates.y),
                };
                return (
                  <g key={cluster.id}>
                    <circle
                      cx={clusterX}
                      cy={clusterY}
                      r={54}
                      fill="hsla(var(--card) / 0.6)"
                      stroke="hsla(var(--grid-line) / 0.4)"
                      strokeWidth={1.6}
                    />
                    <text
                      x={clusterX}
                      y={cluster.orientation === "top" ? clusterY - 64 : clusterY + 74}
                      textAnchor="middle"
                      className="font-mono"
                      fill="hsla(var(--foreground) / 0.65)"
                      fontSize={12}
                    >
                      {cluster.label.toUpperCase()}
                    </text>
                    <text
                      x={clusterX}
                      y={cluster.orientation === "top" ? clusterY - 48 : clusterY + 56}
                      textAnchor="middle"
                      fill="hsla(var(--foreground) / 0.45)"
                      fontSize={10}
                    >
                      {cluster.commentary}
                    </text>
                  </g>
                );
              })}

              {edges.map((edge) => {
                const subsystemPosition = subsystemPositions.get(edge.subsystemId);
                const vendorPosition = vendorPositions.get(edge.vendorId);
                if (!subsystemPosition || !vendorPosition) return null;

                const cluster = vendorPosition.cluster;
                const startX = subsystemPosition.centerX;
                const startY = CORE_SPINE_Y;
                const endX = vendorPosition.x;
                const endY = vendorPosition.y;
                const isSubsystemActive = edge.subsystemId === selectedSubsystem.id;
                const vendorConnections = vendorSubsystemSet.get(edge.vendorId);
                const isPinchPoint = (vendorConnections?.size ?? 0) > 1;
                const path = createConnectionPath(
                  startX,
                  startY,
                  endX,
                  endY,
                  cluster.orientation,
                );
                const sourceSubsystem = subsystemById.get(edge.subsystemId);

                const activeStroke = colorWithAlpha(
                  (sourceSubsystem ?? selectedSubsystem).colorToken,
                  0.9,
                );
                const passiveStroke = sourceSubsystem
                  ? colorWithAlpha(sourceSubsystem.connectionToken, 0.32)
                  : defaultConnectionColor;

                const stroke =
                  edge.exclusivity === "single-source"
                    ? "hsl(var(--destructive))"
                    : isSubsystemActive
                      ? activeStroke
                      : passiveStroke;

                const opacity = isSubsystemActive
                  ? 0.95
                  : isPinchPoint
                    ? 0.7
                    : 0.26;

                const strokeWidth = Math.max(1.5, 1 + edge.strength * 1.05);

                return (
                  <path
                    key={`${edge.componentId}-${edge.vendorId}`}
                    d={path}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={opacity}
                    className="transition-all duration-500 ease-out"
                  />
                );
              })}

              {vendors.map((vendor) => {
                const position = vendorPositions.get(vendor.id);
                if (!position) return null;
                const vendorConnections = vendorSubsystemSet.get(vendor.id);
                const isPinchPoint = (vendorConnections?.size ?? 0) > 1;
                const isActive = vendorConnections?.has(selectedSubsystem.id) ?? false;

                const fillColor = isActive
                  ? colorWithAlpha(selectedSubsystem.colorToken, 0.92)
                  : isPinchPoint
                    ? "hsla(var(--accent) / 0.22)"
                    : defaultConnectionColor;

                const strokeColor = isPinchPoint
                  ? "hsl(var(--accent))"
                  : isActive
                    ? colorWithAlpha(selectedSubsystem.colorToken, 0.95)
                    : "hsla(var(--ring) / 0.4)";

                return (
                  <g key={vendor.id}>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={isPinchPoint ? 16 : 13}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isPinchPoint ? 3 : 1.5}
                      opacity={isActive ? 1 : isPinchPoint ? 0.9 : 0.75}
                    />
                    <text
                      x={position.x}
                      y={position.y + (isPinchPoint ? 28 : 24)}
                      textAnchor="middle"
                      fill="hsla(var(--foreground) / 0.78)"
                      fontSize={11}
                    >
                      {vendor.shortName}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="-mb-3 flex flex-wrap gap-2 pb-6">
            {subsystems.map((subsystem) => {
              const isActive = subsystem.id === selectedSubsystem.id;
              return (
                <button
                  key={subsystem.id}
                  type="button"
                  onClick={() => onSelect(subsystem.id)}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.42em] transition-all",
                    isActive
                      ? "border-white/30 bg-white/10 text-foreground"
                      : "border-white/10 bg-white/5 text-foreground/60 hover:text-foreground/80",
                  )}
                  style={{
                    boxShadow: isActive
                      ? `0 0 0 1px ${colorWithAlpha(subsystem.colorToken, 0.65)}`
                      : undefined,
                  }}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: colorWithAlpha(subsystem.colorToken, 0.9),
                    }}
                  />
                  {subsystem.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

NetworkMap.displayName = "NetworkMap";

export default NetworkMap;
