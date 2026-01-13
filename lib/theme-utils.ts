
import { BrandSettings } from "@/types/theme";

export const DEFAULT_THEME: BrandSettings = {
  identity: {
    companyName: "Acme Corp",
    logoUrl: "/placeholder-logo.png",
  },
  colors: {
    primary: "#0F172A", // Navy
    secondary: "#D4AF37", // Gold
    accent: "#10B981", // Emerald
    background: "#F8FAFC", // Slate 50
    sidebar: "#1E293B", // Slate 800
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
  },
  radius: 0.5,
};

export const PRESETS: Record<string, Partial<BrandSettings>> = {
  Oceanic: {
    colors: { primary: "#0E7490", secondary: "#A5F3FC", accent: "#F59E0B", background: "#ECFEFF", sidebar: "#164E63" }
  },
  Royal: {
    colors: { primary: "#4338CA", secondary: "#E0E7FF", accent: "#EC4899", background: "#F5F3FF", sidebar: "#312E81" }
  },
  Midnight: {
    colors: { primary: "#000000", secondary: "#94A3B8", accent: "#6366F1", background: "#0F172A", sidebar: "#020617" }
  }
};

/**
 * CRITICAL: Converts Hex to space-separated HSL for Tailwind opacity support.
 * Example: "#0F172A" -> "222.2 47.4% 11.2%"
 */
export function hexToHsl(hex: string): string {
  let c = hex.substring(1).split("");
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  const r = parseInt(c[0] + c[1], 16) / 255;
  const g = parseInt(c[2] + c[3], 16) / 255;
  const b = parseInt(c[4] + c[5], 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

export function getContrastColor(hex: string): "black" | "white" {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}
