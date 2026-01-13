
import { Order, CartItem } from '@/types/retail';
import { UserLedger } from '@/types/loyalty';

// Mock DB
const LEDGERS: Record<string, UserLedger> = {};

export async function finalizeLoyaltyOrder(order: Order): Promise<void> {
  if (!order.customerId) return;

  // Retrieve Ledger
  let ledger = LEDGERS[order.customerId] || { ownerId: order.customerId, credits: [] };

  for (const item of order.items) {
    // 1. Handle Membership Purchase
    if (item.category === 'MEMBERSHIP') {
      // In real app, look up duration from definition
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      
      ledger.activeMembership = {
        id: `um_${Date.now()}`,
        ownerId: order.customerId,
        membershipDefinitionId: item.id, // Assuming product ID maps to Mem Def ID for simplicity
        status: 'ACTIVE',
        startedAt: new Date().toISOString(),
        nextBillDate: oneMonthLater.toISOString(),
      };
    }

    // 2. Handle Package Purchase (Issue Credits)
    if (item.category === 'PACKAGE') {
      // In real app, fetch definition to know how many credits
      // Mocking 10 credits for any package
      const newCredit = {
        id: `cr_${Date.now()}`,
        ownerId: order.customerId,
        packageDefinitionId: item.id,
        serviceCategory: 'SERVICE' as any,
        remaining: 10,
        isHourly: false,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };
      ledger.credits.push(newCredit);
    }

    // 3. Handle Credit Redemption (Use Credits)
    if (item.isRedemption && item.redeemedCreditId) {
      const creditIdx = ledger.credits.findIndex(c => c.id === item.redeemedCreditId);
      if (creditIdx > -1) {
        ledger.credits[creditIdx].remaining -= item.quantity;
        // Clean up empty credits
        if (ledger.credits[creditIdx].remaining <= 0) {
          ledger.credits.splice(creditIdx, 1);
        }
      }
    }
  }

  // Save Ledger
  LEDGERS[order.customerId] = ledger;
  console.log(`[Loyalty] Updated Ledger for ${order.customerId}`, ledger);
}
