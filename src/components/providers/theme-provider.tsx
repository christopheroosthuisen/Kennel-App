
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { BrandSettings } from "../../types/theme";
import { DEFAULT_THEME, hexToHsl, getContrastColor } from "../../lib/theme-utils";

interface ThemeContextType {
  settings: BrandSettings;
  updateSettings: (newSettings: Partial<BrandSettings>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  console.log("[ThemeProvider] Mounting...");
  
  const [settings, setSettings] = useState<BrandSettings>(DEFAULT_THEME);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load from localStorage on mount
  useEffect(() => {
    console.log("[ThemeProvider] Initializing from storage...");
    const saved = localStorage.getItem("brand_settings");
    if (saved) {
      try {
        setSettings({ ...DEFAULT_THEME, ...JSON.parse(saved) });
        console.log("[ThemeProvider] Loaded saved settings");
      } catch (e) {
        console.error("[ThemeProvider] Failed to parse theme settings", e);
      }
    } else {
        console.log("[ThemeProvider] No saved settings, using default");
    }
    setIsLoaded(true);
  }, []);

  // 2. Inject CSS Variables and Fonts whenever settings change
  useEffect(() => {
    if (!isLoaded) return;

    console.log("[ThemeProvider] Injecting CSS variables...");
    const root = document.documentElement;
    const { colors, radius, typography } = settings;

    // --- Color Injection (Hex -> HSL) ---
    root.style.setProperty("--primary", hexToHsl(colors.primary));
    root.style.setProperty("--primary-foreground", hexToHsl(getContrastColor(colors.primary) === 'white' ? '#FFFFFF' : '#000000'));
    
    root.style.setProperty("--secondary", hexToHsl(colors.secondary));
    root.style.setProperty("--secondary-foreground", hexToHsl(getContrastColor(colors.secondary) === 'white' ? '#FFFFFF' : '#000000'));

    root.style.setProperty("--accent", hexToHsl(colors.accent));
    root.style.setProperty("--accent-foreground", hexToHsl(getContrastColor(colors.accent) === 'white' ? '#FFFFFF' : '#000000'));

    root.style.setProperty("--background", hexToHsl(colors.background));
    
    // --- Shape Injection ---
    root.style.setProperty("--radius", `${radius}rem`);

    // --- Typography Injection ---
    // Update variables
    root.style.setProperty("--font-heading", typography.headingFont);
    root.style.setProperty("--font-body", typography.bodyFont);

    // Dynamically load Google Fonts
    const fontsToLoad = [typography.headingFont, typography.bodyFont];
    const uniqueFonts = Array.from(new Set(fontsToLoad)).map(f => f.replace(" ", "+"));
    
    const linkId = "dynamic-theme-fonts";
    const existingLink = document.getElementById(linkId);
    
    if (uniqueFonts.length > 0) {
      const href = `https://fonts.googleapis.com/css2?family=${uniqueFonts.join("&family=")}:wght@400;500;600;700&display=swap`;
      
      if (existingLink) {
        if (existingLink.getAttribute("href") !== href) {
          existingLink.setAttribute("href", href);
        }
      } else {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    }

    // Persist
    localStorage.setItem("brand_settings", JSON.stringify(settings));

  }, [settings, isLoaded]);

  const updateSettings = (newSettings: Partial<BrandSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      colors: { ...prev.colors, ...(newSettings.colors || {}) },
      identity: { ...prev.identity, ...(newSettings.identity || {}) },
      typography: { ...prev.typography, ...(newSettings.typography || {}) },
    }));
  };

  const resetTheme = () => {
    setSettings(DEFAULT_THEME);
  };

  if (!isLoaded) {
    console.log("[ThemeProvider] Waiting for load...");
    return null; // Or a loader
  }

  console.log("[ThemeProvider] Render children");
  return (
    <ThemeContext.Provider value={{ settings, updateSettings, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
