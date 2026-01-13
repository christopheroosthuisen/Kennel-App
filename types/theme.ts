
export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  sidebar: string;
}

export interface BrandTypography {
  headingFont: string;
  bodyFont: string;
}

export interface BrandIdentity {
  companyName: string;
  logoUrl: string;
}

export interface BrandSettings {
  identity: BrandIdentity;
  colors: BrandColors;
  typography: BrandTypography;
  radius: number; // 0 to 1.5 rem
}

export type ThemePreset = 'Platinum' | 'Oceanic' | 'Midnight' | 'Royal';
