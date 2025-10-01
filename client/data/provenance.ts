export type ExclusivityLevel = "single-source" | "preferred" | "multi-source";

export type ComponentVendorRelationship = {
  vendorId: string;
  strength: number; // 1 (loose) → 5 (strategic integration)
  exclusivity: ExclusivityLevel;
};

export type ComponentNode = {
  id: string;
  name: string;
  tier: "OEM" | "Tier 1" | "Tier 2";
  origin: string;
  leadTimeWeeks: number;
  relationships: ComponentVendorRelationship[];
};

export type SubsystemNode = {
  id:
    | "intake"
    | "fan"
    | "compressor"
    | "combustor"
    | "turbine"
    | "nozzle"
    | "exhaust"
    | "auxiliaries";
  name: string;
  summary: string;
  colorToken: string;
  connectionToken: string;
  geometry: {
    start: number; // percentage along turbine spine (0 → 100)
    end: number;
  };
  components: ComponentNode[];
};

export type VendorNode = {
  id: string;
  name: string;
  shortName: string;
  region:
    | "North America"
    | "Europe"
    | "Asia Pacific"
    | "Middle East & Africa"
    | "Latin America";
  primaryLocation: string;
  reliabilityScore: number; // 0 → 100
  qualityScore: number; // 0 → 100
  clusterId: string;
  specialties: string[];
};

export type VendorCluster = {
  id: string;
  label: string;
  region: VendorNode["region"];
  coordinates: {
    x: number; // 0 → 100 relative to viewBox width
    y: number; // 0 → 100 relative to viewBox height
  };
  orientation: "top" | "bottom";
  commentary: string;
};

export const VENDOR_CLUSTERS: VendorCluster[] = [
  {
    id: "americas",
    label: "North America",
    region: "North America",
    coordinates: { x: 18, y: 18 },
    orientation: "top",
    commentary: "Legacy OEM partners for cold-section fabrication and digital telemetry packages.",
  },
  {
    id: "europe",
    label: "Europe",
    region: "Europe",
    coordinates: { x: 46, y: 15 },
    orientation: "top",
    commentary: "Precision machining and additive manufacturing partners clustered around the Rhine corridor.",
  },
  {
    id: "asia-pacific",
    label: "Asia Pacific",
    region: "Asia Pacific",
    coordinates: { x: 78, y: 20 },
    orientation: "top",
    commentary: "Advanced ceramics and high-temperature composites with resilient multi-source strategies.",
  },
  {
    id: "middle-east",
    label: "Middle East & Africa",
    region: "Middle East & Africa",
    coordinates: { x: 62, y: 82 },
    orientation: "bottom",
    commentary: "Flow hardware, seals, and hot-section service depots supporting turnaround windows.",
  },
  {
    id: "latin-america",
    label: "Latin America",
    region: "Latin America",
    coordinates: { x: 30, y: 78 },
    orientation: "bottom",
    commentary: "Controls and power electronics with rapid retooling programs for derivative builds.",
  },
];

export const VENDORS: VendorNode[] = [
  {
    id: "ventus-aero",
    name: "Ventus Aero Systems",
    shortName: "Ventus",
    region: "North America",
    primaryLocation: "Cincinnati, USA",
    reliabilityScore: 88,
    qualityScore: 92,
    clusterId: "americas",
    specialties: ["Fan hub machining", "Digital twinning"],
  },
  {
    id: "northstar-materials",
    name: "Northstar Advanced Materials",
    shortName: "Northstar",
    region: "North America",
    primaryLocation: "Montreal, Canada",
    reliabilityScore: 83,
    qualityScore: 90,
    clusterId: "americas",
    specialties: ["Cryogenic titanium billets", "Surface treatments"],
  },
  {
    id: "atlantic-composite",
    name: "Atlantic Composite Structures",
    shortName: "Atlantic",
    region: "North America",
    primaryLocation: "Savannah, USA",
    reliabilityScore: 79,
    qualityScore: 87,
    clusterId: "americas",
    specialties: ["Inlet fairings", "Acoustic liners"],
  },
  {
    id: "rhine-metals",
    name: "Rhine Metals Group",
    shortName: "Rhine",
    region: "Europe",
    primaryLocation: "Cologne, Germany",
    reliabilityScore: 91,
    qualityScore: 94,
    clusterId: "europe",
    specialties: ["Blisk milling", "High-speed balancing"],
  },
  {
    id: "berlin-precision",
    name: "Berlin Precision Forge",
    shortName: "Berlin",
    region: "Europe",
    primaryLocation: "Berlin, Germany",
    reliabilityScore: 86,
    qualityScore: 91,
    clusterId: "europe",
    specialties: ["Compressor discs", "Vaned stators"],
  },
  {
    id: "copenhagen-sensors",
    name: "Copenhagen Sensor Labs",
    shortName: "Copenhagen",
    region: "Europe",
    primaryLocation: "Copenhagen, Denmark",
    reliabilityScore: 82,
    qualityScore: 88,
    clusterId: "europe",
    specialties: ["Combustion dynamics sensors", "Thermal drift compensation"],
  },
  {
    id: "kyoto-ceramics",
    name: "Kyoto Ceramic Works",
    shortName: "Kyoto",
    region: "Asia Pacific",
    primaryLocation: "Kyoto, Japan",
    reliabilityScore: 95,
    qualityScore: 96,
    clusterId: "asia-pacific",
    specialties: ["Ceramic matrix composites", "Thermal barrier coatings"],
  },
  {
    id: "osaka-turbine",
    name: "Osaka Turbine Fabrication",
    shortName: "Osaka",
    region: "Asia Pacific",
    primaryLocation: "Osaka, Japan",
    reliabilityScore: 89,
    qualityScore: 93,
    clusterId: "asia-pacific",
    specialties: ["High-pressure turbine blades", "Directional solidification"],
  },
  {
    id: "mumbai-seals",
    name: "Mumbai Flow Seals",
    shortName: "Mumbai",
    region: "Asia Pacific",
    primaryLocation: "Mumbai, India",
    reliabilityScore: 77,
    qualityScore: 85,
    clusterId: "asia-pacific",
    specialties: ["Labyrinth seals", "Elastomeric flex joints"],
  },
  {
    id: "abu-dhabi-flow",
    name: "Abu Dhabi Flowtech",
    shortName: "AD Flow",
    region: "Middle East & Africa",
    primaryLocation: "Abu Dhabi, UAE",
    reliabilityScore: 84,
    qualityScore: 88,
    clusterId: "middle-east",
    specialties: ["Fuel manifolds", "High-temperature manifolds"],
  },
  {
    id: "istanbul-alloys",
    name: "Istanbul Alloy Partners",
    shortName: "Istanbul",
    region: "Middle East & Africa",
    primaryLocation: "Istanbul, Türkiye",
    reliabilityScore: 81,
    qualityScore: 86,
    clusterId: "middle-east",
    specialties: ["Superalloy castings", "Nozzle guide vanes"],
  },
  {
    id: "andes-composite",
    name: "Andes Composite Lab",
    shortName: "Andes",
    region: "Latin America",
    primaryLocation: "Quito, Ecuador",
    reliabilityScore: 73,
    qualityScore: 82,
    clusterId: "latin-america",
    specialties: ["Auxiliary ducts", "Rapid tooling"],
  },
  {
    id: "buenos-aires-controls",
    name: "Buenos Aires Controls",
    shortName: "BA Controls",
    region: "Latin America",
    primaryLocation: "Buenos Aires, Argentina",
    reliabilityScore: 80,
    qualityScore: 86,
    clusterId: "latin-america",
    specialties: ["Control harnesses", "Power converters"],
  },
  {
    id: "sao-paulo-avionics",
    name: "São Paulo Avionics",
    shortName: "São Paulo",
    region: "Latin America",
    primaryLocation: "São Paulo, Brazil",
    reliabilityScore: 76,
    qualityScore: 84,
    clusterId: "latin-america",
    specialties: ["Auxiliary electronics", "Health monitoring"],
  },
];

export const SUBSYSTEMS: SubsystemNode[] = [
  {
    id: "intake",
    name: "Intake",
    summary: "Air inlet and flow conditioning assembly managing icing and acoustic attenuation.",
    colorToken: "--subsystem-intake",
    connectionToken: "--subsystem-connection",
    geometry: { start: 2, end: 13 },
    components: [
      {
        id: "intake-lip",
        name: "Inlet Lip Skin Panels",
        tier: "Tier 1",
        origin: "Canada",
        leadTimeWeeks: 8,
        relationships: [
          { vendorId: "northstar-materials", strength: 3.5, exclusivity: "preferred" },
          { vendorId: "andes-composite", strength: 2.5, exclusivity: "multi-source" },
        ],
      },
      {
        id: "acoustic-liner",
        name: "Acoustic Honeycomb Liner",
        tier: "Tier 1",
        origin: "USA",
        leadTimeWeeks: 10,
        relationships: [
          { vendorId: "atlantic-composite", strength: 4, exclusivity: "single-source" },
        ],
      },
      {
        id: "ice-protection",
        name: "Electrothermal Ice Protection Grid",
        tier: "Tier 2",
        origin: "USA",
        leadTimeWeeks: 12,
        relationships: [
          { vendorId: "ventus-aero", strength: 3, exclusivity: "preferred" },
          { vendorId: "buenos-aires-controls", strength: 2, exclusivity: "multi-source" },
        ],
      },
    ],
  },
  {
    id: "fan",
    name: "Fan",
    summary: "Front fan module including hub, blades, and composite fan case interfaces.",
    colorToken: "--subsystem-fan",
    connectionToken: "--subsystem-connection",
    geometry: { start: 13, end: 25 },
    components: [
      {
        id: "fan-hub",
        name: "Fan Hub Assembly",
        tier: "OEM",
        origin: "USA",
        leadTimeWeeks: 18,
        relationships: [
          { vendorId: "ventus-aero", strength: 4.5, exclusivity: "single-source" },
          { vendorId: "rhine-metals", strength: 3.5, exclusivity: "preferred" },
        ],
      },
      {
        id: "fan-blade",
        name: "Composite Fan Blade Pack",
        tier: "Tier 1",
        origin: "Japan",
        leadTimeWeeks: 16,
        relationships: [
          { vendorId: "kyoto-ceramics", strength: 5, exclusivity: "single-source" },
        ],
      },
      {
        id: "fan-case",
        name: "Fan Containment Case",
        tier: "Tier 1",
        origin: "Germany",
        leadTimeWeeks: 14,
        relationships: [
          { vendorId: "rhine-metals", strength: 4, exclusivity: "preferred" },
          { vendorId: "atlantic-composite", strength: 2.5, exclusivity: "multi-source" },
        ],
      },
    ],
  },
  {
    id: "compressor",
    name: "Compressor",
    summary: "Low and high-pressure compressor rows with blisk integration and active clearance control.",
    colorToken: "--subsystem-compressor",
    connectionToken: "--subsystem-connection",
    geometry: { start: 25, end: 42 },
    components: [
      {
        id: "lpc-blisk",
        name: "Low-Pressure Blisk",
        tier: "Tier 1",
        origin: "Germany",
        leadTimeWeeks: 20,
        relationships: [
          { vendorId: "berlin-precision", strength: 4.2, exclusivity: "preferred" },
          { vendorId: "rhine-metals", strength: 3.8, exclusivity: "preferred" },
        ],
      },
      {
        id: "hpc-case",
        name: "High-Pressure Compressor Case",
        tier: "OEM",
        origin: "USA",
        leadTimeWeeks: 22,
        relationships: [
          { vendorId: "ventus-aero", strength: 3.6, exclusivity: "preferred" },
          { vendorId: "istanbul-alloys", strength: 2.8, exclusivity: "multi-source" },
        ],
      },
      {
        id: "variable-vane",
        name: "Variable Stator Vane Set",
        tier: "Tier 2",
        origin: "Türkiye",
        leadTimeWeeks: 12,
        relationships: [
          { vendorId: "istanbul-alloys", strength: 3.4, exclusivity: "preferred" },
          { vendorId: "mumbai-seals", strength: 2.5, exclusivity: "multi-source" },
        ],
      },
    ],
  },
  {
    id: "combustor",
    name: "Combustor",
    summary: "Annular combustor module with low-NOx injectors and real-time sensing.",
    colorToken: "--subsystem-combustor",
    connectionToken: "--subsystem-connection",
    geometry: { start: 42, end: 55 },
    components: [
      {
        id: "combustor-liner",
        name: "CMO Liner Panels",
        tier: "Tier 1",
        origin: "Japan",
        leadTimeWeeks: 18,
        relationships: [
          { vendorId: "kyoto-ceramics", strength: 4.6, exclusivity: "single-source" },
          { vendorId: "istanbul-alloys", strength: 2.9, exclusivity: "preferred" },
        ],
      },
      {
        id: "fuel-nozzle",
        name: "Staged Fuel Nozzle Pack",
        tier: "Tier 1",
        origin: "UAE",
        leadTimeWeeks: 14,
        relationships: [
          { vendorId: "abu-dhabi-flow", strength: 4, exclusivity: "preferred" },
        ],
      },
      {
        id: "combustion-sensors",
        name: "Combustion Dynamics Sensor Suite",
        tier: "Tier 2",
        origin: "Denmark",
        leadTimeWeeks: 10,
        relationships: [
          { vendorId: "copenhagen-sensors", strength: 4.4, exclusivity: "single-source" },
          { vendorId: "sao-paulo-avionics", strength: 2.6, exclusivity: "multi-source" },
        ],
      },
    ],
  },
  {
    id: "turbine",
    name: "Turbine",
    summary: "High and low-pressure turbine assembly with cooling manifolds and shroud management.",
    colorToken: "--subsystem-turbine",
    connectionToken: "--subsystem-connection",
    geometry: { start: 55, end: 75 },
    components: [
      {
        id: "hpt-blade",
        name: "High-Pressure Rotor Blades",
        tier: "Tier 1",
        origin: "Japan",
        leadTimeWeeks: 24,
        relationships: [
          { vendorId: "osaka-turbine", strength: 4.8, exclusivity: "single-source" },
          { vendorId: "istanbul-alloys", strength: 3.1, exclusivity: "preferred" },
        ],
      },
      {
        id: "turbine-shroud",
        name: "Active Shroud Segment",
        tier: "OEM",
        origin: "Germany",
        leadTimeWeeks: 19,
        relationships: [
          { vendorId: "rhine-metals", strength: 4.1, exclusivity: "preferred" },
          { vendorId: "osaka-turbine", strength: 3.2, exclusivity: "preferred" },
        ],
      },
      {
        id: "cooling-manifold",
        name: "Cooling Manifold Assembly",
        tier: "Tier 1",
        origin: "UAE",
        leadTimeWeeks: 15,
        relationships: [
          { vendorId: "abu-dhabi-flow", strength: 3.7, exclusivity: "preferred" },
          { vendorId: "mumbai-seals", strength: 2.9, exclusivity: "multi-source" },
        ],
      },
    ],
  },
  {
    id: "nozzle",
    name: "Nozzle",
    summary: "Variable area exhaust nozzle, convergent-divergent petals, and actuation package.",
    colorToken: "--subsystem-nozzle",
    connectionToken: "--subsystem-connection",
    geometry: { start: 75, end: 87 },
    components: [
      {
        id: "nozzle-petal",
        name: "Nozzle Petal Pack",
        tier: "Tier 1",
        origin: "Türkiye",
        leadTimeWeeks: 12,
        relationships: [
          { vendorId: "istanbul-alloys", strength: 4, exclusivity: "preferred" },
          { vendorId: "kyoto-ceramics", strength: 3.2, exclusivity: "preferred" },
        ],
      },
      {
        id: "nozzle-actuator",
        name: "Vectoring Actuation System",
        tier: "Tier 2",
        origin: "Argentina",
        leadTimeWeeks: 11,
        relationships: [
          { vendorId: "buenos-aires-controls", strength: 3.6, exclusivity: "preferred" },
          { vendorId: "sao-paulo-avionics", strength: 2.8, exclusivity: "multi-source" },
        ],
      },
      {
        id: "thermal-shield",
        name: "Thermal Shield Liner",
        tier: "Tier 1",
        origin: "Japan",
        leadTimeWeeks: 13,
        relationships: [
          { vendorId: "kyoto-ceramics", strength: 4.4, exclusivity: "single-source" },
        ],
      },
    ],
  },
  {
    id: "exhaust",
    name: "Exhaust",
    summary: "Ejector, mixer, and thrust reverser structure with ultrasound-health instrumentation.",
    colorToken: "--subsystem-exhaust",
    connectionToken: "--subsystem-connection",
    geometry: { start: 87, end: 97 },
    components: [
      {
        id: "ejector-mixer",
        name: "Ejector/Mixer Assembly",
        tier: "Tier 1",
        origin: "Türkiye",
        leadTimeWeeks: 14,
        relationships: [
          { vendorId: "istanbul-alloys", strength: 3.7, exclusivity: "preferred" },
          { vendorId: "andes-composite", strength: 2.6, exclusivity: "multi-source" },
        ],
      },
      {
        id: "thrust-reverser",
        name: "Thrust Reverser Bucket",
        tier: "Tier 1",
        origin: "Brazil",
        leadTimeWeeks: 15,
        relationships: [
          { vendorId: "sao-paulo-avionics", strength: 3.1, exclusivity: "preferred" },
          { vendorId: "atlantic-composite", strength: 2.9, exclusivity: "multi-source" },
        ],
      },
      {
        id: "ultrasound-health",
        name: "Ultrasound Health Sensors",
        tier: "Tier 2",
        origin: "Denmark",
        leadTimeWeeks: 9,
        relationships: [
          { vendorId: "copenhagen-sensors", strength: 4.1, exclusivity: "single-source" },
          { vendorId: "sao-paulo-avionics", strength: 2.4, exclusivity: "multi-source" },
        ],
      },
    ],
  },
  {
    id: "auxiliaries",
    name: "Auxiliaries",
    summary: "Accessory gearbox, starter, and auxiliary power electronics with remote diagnostics.",
    colorToken: "--subsystem-auxiliaries",
    connectionToken: "--subsystem-connection",
    geometry: { start: 32, end: 90 },
    components: [
      {
        id: "gearbox",
        name: "Accessory Gearbox",
        tier: "OEM",
        origin: "USA",
        leadTimeWeeks: 20,
        relationships: [
          { vendorId: "ventus-aero", strength: 3.9, exclusivity: "preferred" },
          { vendorId: "buenos-aires-controls", strength: 2.7, exclusivity: "multi-source" },
        ],
      },
      {
        id: "starter-generator",
        name: "Starter Generator",
        tier: "Tier 1",
        origin: "Argentina",
        leadTimeWeeks: 13,
        relationships: [
          { vendorId: "buenos-aires-controls", strength: 3.4, exclusivity: "preferred" },
          { vendorId: "sao-paulo-avionics", strength: 2.6, exclusivity: "multi-source" },
        ],
      },
      {
        id: "health-monitor",
        name: "Health Monitoring Gateway",
        tier: "Tier 2",
        origin: "Brazil",
        leadTimeWeeks: 9,
        relationships: [
          { vendorId: "sao-paulo-avionics", strength: 3.2, exclusivity: "preferred" },
          { vendorId: "copenhagen-sensors", strength: 2.8, exclusivity: "preferred" },
        ],
      },
    ],
  },
];

export const SUBSYSTEM_SEQUENCE = SUBSYSTEMS.map((subsystem) => subsystem.id);

export const ALL_VENDOR_IDS = VENDORS.map((vendor) => vendor.id);
