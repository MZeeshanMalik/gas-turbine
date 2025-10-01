import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        glow: {
          primary: "hsl(var(--glow-primary))",
          secondary: "hsl(var(--glow-secondary))",
        },
        subsystem: {
          fan: "hsl(var(--subsystem-fan))",
          compressor: "hsl(var(--subsystem-compressor))",
          combustor: "hsl(var(--subsystem-combustor))",
          turbine: "hsl(var(--subsystem-turbine))",
          nozzle: "hsl(var(--subsystem-nozzle))",
          intake: "hsl(var(--subsystem-intake))",
          exhaust: "hsl(var(--subsystem-exhaust))",
          auxiliaries: "hsl(var(--subsystem-auxiliaries))",
          connection: "hsl(var(--subsystem-connection))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        "grid-blueprint":
          "linear-gradient(90deg, hsla(var(--grid-cross) / 0.35) 1px, transparent 1px), linear-gradient(180deg, hsla(var(--grid-line) / 0.25) 1px, transparent 1px)",
        "glow-radial":
          "radial-gradient(circle at center, hsla(var(--glow-primary) / 0.35) 0%, transparent 60%)",
      },
      boxShadow: {
        floating: "0 24px 60px -28px rgba(5, 18, 36, 0.85)",
        inset: "inset 0 1px 0 hsla(var(--grid-line) / 0.65)",
      },
      dropShadow: {
        glow: "0 0 18px hsla(var(--glow-primary) / 0.45)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
