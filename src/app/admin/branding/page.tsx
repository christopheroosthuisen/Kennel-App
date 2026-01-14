
"use client";

import React, { useState } from "react";
import { useTheme } from "../../../components/providers/theme-provider";
import { Button, Input, Label, Slider, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Separator, Select } from "../../../components/Common";
import { Loader2, Save, LayoutDashboard, Calendar, Users, Settings } from "lucide-react";
import { PRESETS, DEFAULT_THEME } from "../../../lib/theme-utils";
import { updateBrandSettings } from "../../../store/actions/crm-interactions";
import { ThemePreset } from "../../../types/theme";

const FONT_OPTIONS = ["Inter", "Roboto", "Open Sans", "Lato", "Playfair Display", "Montserrat"];

export default function BrandSettingsPage() {
  const { settings, updateSettings, resetTheme } = useTheme();
  const [isPending, setIsPending] = useState(false);

  const handleColorChange = (key: keyof typeof settings.colors, value: string) => {
    updateSettings({ colors: { ...settings.colors, [key]: value } });
  };

  const handlePresetChange = (preset: ThemePreset) => {
    const p = PRESETS[preset];
    if (p) updateSettings(p);
  };

  const handleSave = async () => {
    setIsPending(true);
    await updateBrandSettings(settings);
    setIsPending(false);
    // Optional: Add toast notification here
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col md:flex-row theme-transition bg-background text-foreground">
      
      {/* LEFT COLUMN: Controls (40%) */}
      <div className="w-full md:w-2/5 p-6 border-r overflow-y-auto bg-card">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading">Theme Engine</h1>
          <p className="text-muted-foreground text-sm">Customize the look and feel of your application.</p>
        </div>

        <div className="space-y-8">
          {/* Identity */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Identity</h3>
            <div className="grid gap-2">
              <Label>Company Name</Label>
              <Input 
                value={settings.identity.companyName} 
                onChange={(e) => updateSettings({ identity: { ...settings.identity, companyName: e.target.value } })}
              />
            </div>
          </section>

          <Separator />

          {/* Colors */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Palette</h3>
              <Select 
                onChange={(e) => handlePresetChange(e.target.value as ThemePreset)}
                className="w-[120px] h-8 text-xs"
              >
                <option value="" disabled selected>Presets</option>
                <option value="Platinum">Platinum</option>
                <option value="Oceanic">Oceanic</option>
                <option value="Royal">Royal</option>
                <option value="Midnight">Midnight</option>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(settings.colors).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="capitalize text-xs">{key}</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full border shadow-sm overflow-hidden">
                      <input 
                        type="color" 
                        value={value as string} 
                        onChange={(e) => handleColorChange(key as any, e.target.value)}
                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                      />
                    </div>
                    <Input 
                      value={value as string} 
                      onChange={(e) => handleColorChange(key as any, e.target.value)}
                      className="font-mono text-xs h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Typography */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Typography</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heading Font</Label>
                <Select 
                  value={settings.typography.headingFont} 
                  onChange={(e) => updateSettings({ typography: { ...settings.typography, headingFont: e.target.value } })}
                >
                  {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Body Font</Label>
                <Select 
                  value={settings.typography.bodyFont} 
                  onChange={(e) => updateSettings({ typography: { ...settings.typography, bodyFont: e.target.value } })}
                >
                  {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </Select>
              </div>
            </div>
          </section>

          <Separator />

          {/* Shape */}
          <section className="space-y-4">
            <div className="flex justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Shape</h3>
              <span className="text-xs text-muted-foreground">{settings.radius}rem</span>
            </div>
            <div className="px-1">
              <Slider 
                min={0} 
                max={1.5} 
                step={0.1} 
                value={settings.radius} 
                onValueChange={(vals) => updateSettings({ radius: vals[0] })} 
              />
            </div>
          </section>

          <div className="pt-6 flex gap-3">
            <Button onClick={handleSave} disabled={isPending} className="flex-1">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save & Publish
            </Button>
            <Button variant="outline" onClick={resetTheme}>Reset</Button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Live Preview (60%) */}
      <div className="hidden md:flex w-3/5 bg-slate-100/50 p-8 items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 pattern-grid-lg text-slate-200/50 pointer-events-none" />
        
        {/* Mock Application Interface */}
        <div className="w-full max-w-4xl h-[80vh] bg-background border shadow-2xl rounded-lg flex overflow-hidden theme-transition ring-1 ring-slate-900/5">
          
          {/* Mock Sidebar */}
          <div 
            className="w-64 flex-shrink-0 p-4 flex flex-col text-white theme-transition"
            style={{ backgroundColor: settings.colors.sidebar }}
          >
            <div className="flex items-center gap-2 mb-8 px-2">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                <span className="font-bold text-primary-foreground">B</span>
              </div>
              <span className="font-bold font-heading text-lg truncate">{settings.identity.companyName}</span>
            </div>
            
            <nav className="space-y-1">
              {['Dashboard', 'Bookings', 'Customers', 'Settings'].map((item, i) => (
                <div key={item} className={`flex items-center gap-3 px-3 py-2 rounded text-sm ${i===0 ? 'bg-primary text-primary-foreground' : 'hover:bg-white/10 opacity-80'}`}>
                  {i === 0 && <LayoutDashboard className="w-4 h-4" />}
                  {i === 1 && <Calendar className="w-4 h-4" />}
                  {i === 2 && <Users className="w-4 h-4" />}
                  {i === 3 && <Settings className="w-4 h-4" />}
                  {item}
                </div>
              ))}
            </nav>
          </div>

          {/* Mock Content */}
          <div className="flex-1 flex flex-col bg-background/50">
            <header className="h-16 border-b flex items-center px-6 justify-between bg-card">
              <h2 className="font-semibold text-lg font-heading">Overview</h2>
              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline">Feedback</Button>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-bold">JD</div>
              </div>
            </header>

            <main className="p-6 overflow-y-auto space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Revenue</CardDescription>
                      <CardTitle className="text-2xl">$45,231.89</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground">+20.1% from last month</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main Card */}
              <Card className="border-accent/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>You have 3 unread notifications</CardDescription>
                    </div>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      VIP Status
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-md bg-muted/50 border border-muted flex items-start gap-4">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">New Customer Signed Up</p>
                      <p className="text-sm text-muted-foreground">
                        John Doe created an account 2 minutes ago.
                      </p>
                    </div>
                    <Button size="sm" className="ml-auto">View Profile</Button>
                  </div>
                  
                  <div className="h-32 rounded-md bg-muted/20 border border-dashed flex items-center justify-center text-muted-foreground text-sm">
                    Chart Placeholder
                  </div>
                </CardContent>
                <CardFooter className="justify-between border-t p-6 bg-muted/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs text-muted-foreground">System Operational</span>
                  </div>
                  <Button variant="default">Generate Report</Button>
                </CardFooter>
              </Card>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
