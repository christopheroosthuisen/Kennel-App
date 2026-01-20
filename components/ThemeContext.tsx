

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Types ---

export interface ThemeSettings {
  primaryColor: string; // The core brand color
  secondaryColor: string; // Sidebar/Dark backgrounds
  fontFamily: string;
  borderRadius: string; // '0px' | '4px' | '8px' | '12px'
}

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
  presets: ThemeSettings[];
}

// --- Constants ---

const DEFAULT_THEME: ThemeSettings = {
  primaryColor: '#0ea5e9', // Sky 500
  secondaryColor: '#0f172a', // Slate 900
  fontFamily: 'Inter',
  borderRadius: '0.5rem', // 8px
};

const PRESETS: ThemeSettings[] = [
  { primaryColor: '#0ea5e9', secondaryColor: '#0f172a', fontFamily: 'Inter', borderRadius: '0.5rem' }, // Default (Tech Blue)
  { primaryColor: '#7c3aed', secondaryColor: '#2e1065', fontFamily: 'Inter', borderRadius: '0.75rem' }, // Royal Purple
  { primaryColor: '#10b981', secondaryColor: '#064e3b', fontFamily: 'Roboto', borderRadius: '0.25rem' }, // Nature Green
  { primaryColor: '#f43f5e', secondaryColor: '#881337', fontFamily: 'Lato', borderRadius: '1rem' }, // Vibrant Rose
  { primaryColor: '#f59e0b', secondaryColor: '#451a03', fontFamily: 'Inter', borderRadius: '0px' }, // Industrial Orange
];

// --- Helper Functions for Color Manipulation ---

// Convert Hex to RGB object
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Lighten/Darken color
const adjustColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
};

// Apply CSS Variables to Root
const applyThemeToDom = (theme: ThemeSettings) => {
  const root = document.documentElement;

  // 1. Font
  root.style.setProperty('--font-sans', theme.fontFamily);
  
  // 2. Border Radius
  root.style.setProperty('--radius', theme.borderRadius);

  // 3. Primary Color Shades (Generating a palette from one color)
  // We approximate Tailwind shades: 50 (lightest) -> 900 (darkest)
  // Assuming input is roughly the 500 or 600 shade
  root.style.setProperty('--color-primary-50', adjustColor(theme.primaryColor, 180));
  root.style.setProperty('--color-primary-100', adjustColor(theme.primaryColor, 150));
  root.style.setProperty('--color-primary-200', adjustColor(theme.primaryColor, 100));
  root.style.setProperty('--color-primary-300', adjustColor(theme.primaryColor, 50));
  root.style.setProperty('--color-primary-400', adjustColor(theme.primaryColor, 20));
  root.style.setProperty('--color-primary-500', theme.primaryColor); // Base
  root.style.setProperty('--color-primary-600', adjustColor(theme.primaryColor, -20));
  root.style.setProperty('--color-primary-700', adjustColor(theme.primaryColor, -40));
  root.style.setProperty('--color-primary-800', adjustColor(theme.primaryColor, -60));
  root.style.setProperty('--color-primary-900', adjustColor(theme.primaryColor, -80));

  // 4. Secondary Color (Sidebar / Dark backgrounds)
  // We handle this simpler, mostly just the base and a lighter version
  root.style.setProperty('--color-secondary-950', theme.secondaryColor);
  root.style.setProperty('--color-secondary-900', adjustColor(theme.secondaryColor, 10));
  root.style.setProperty('--color-secondary-800', adjustColor(theme.secondaryColor, 20));
};

// --- Context ---

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);

  // Load from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('partners_theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        setTheme({ ...DEFAULT_THEME, ...parsed });
      } catch (e) {
        console.error("Failed to load theme", e);
      }
    }
  }, []);

  // Apply to DOM whenever theme changes
  useEffect(() => {
    applyThemeToDom(theme);
    localStorage.setItem('partners_theme', JSON.stringify(theme));
    
    // Inject Font if needed (Simple approach for Google Fonts)
    const fontLink = document.getElementById('dynamic-font-link') as HTMLLinkElement || document.createElement('link');
    fontLink.id = 'dynamic-font-link';
    fontLink.rel = 'stylesheet';
    
    // Map nice names to Google Font URLs
    let fontName = theme.fontFamily;
    if (fontName === 'Inter') fontName = 'Inter:wght@300;400;500;600;700';
    if (fontName === 'Roboto') fontName = 'Roboto:wght@300;400;500;700';
    if (fontName === 'Lato') fontName = 'Lato:wght@300;400;700';
    if (fontName === 'Playfair Display') fontName = 'Playfair+Display:wght@400;700';
    
    fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName}&display=swap`;
    document.head.appendChild(fontLink);

  }, [theme]);

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, presets: PRESETS }}>
      {children}
    </ThemeContext.Provider>
  );
};