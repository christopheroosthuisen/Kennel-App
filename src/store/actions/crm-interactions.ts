
import { z } from "zod";
import { BrandSettings } from "../../types/theme";

// --- Types ---
const ActivitySchema = z.object({
  ownerId: z.string(),
  content: z.string().min(1, "Content cannot be empty"),
  type: z.enum(["CALL", "EMAIL", "NOTE"]),
});

export type ActivityLog = z.infer<typeof ActivitySchema>;

// --- Actions (Client-side mock for SPA) ---

export async function logActivity(data: ActivityLog) {
  // 1. Validate Input
  const result = ActivitySchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: "Invalid data format" };
  }

  // 2. Logic: Sentiment Analysis (Simple)
  let sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
  const lowerContent = data.content.toLowerCase();
  
  if (lowerContent.includes('angry') || lowerContent.includes('upset') || lowerContent.includes('cancel')) {
    sentiment = 'NEGATIVE';
  } else if (lowerContent.includes('happy') || lowerContent.includes('love') || lowerContent.includes('great')) {
    sentiment = 'POSITIVE';
  }

  // 3. Mock DB Interaction
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate latency
  
  console.log(`[DB] Logged activity for ${data.ownerId}:`, { ...data, sentiment });
  
  return { success: true, sentiment };
}

export async function getOwnerSummary(ownerId: string) {
  // Mock data fetch
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return {
    id: ownerId,
    totalSpend: 4520.00,
    lastVisit: new Date().toISOString(),
    status: 'ACTIVE'
  };
}

export async function updateBrandSettings(settings: BrandSettings) {
  // In a real app, this writes to a `tenants` table or a `brand_config` JSON column.
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  console.log("[DB] Brand settings persisted:", settings);
  
  return { success: true };
}
