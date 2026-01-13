
import { CatalogItem, Reservation, ReservationLineItem } from '../../shared/domain';

export interface QuoteResult {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  breakdown: Array<{ description: string; amount: number; quantity: number }>;
}

export function computeNights(startAt: string, endAt: string): number {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export function quoteReservation(
  reservation: Reservation,
  lineItems: ReservationLineItem[],
  catalog: CatalogItem[],
  taxRateBps: number = 0, // 800 = 8%
  discountCents: number = 0
): QuoteResult {
  const breakdown: Array<{ description: string; amount: number; quantity: number }> = [];
  let subtotal = 0;
  let taxableAmount = 0;

  // 1. Calculate Base Rate (Lodging)
  const nights = computeNights(reservation.startAt, reservation.endAt);
  
  // Find a matching base rate from catalog. 
  // In a real app, this might be more complex (e.g. searching by specific category 'Boarding' or 'Daycare')
  // We'll look for a catalog item that fuzzy matches the reservation type for now
  const baseRateItem = catalog.find(c => 
    c.type === 'Service' && 
    c.name.toLowerCase().includes(reservation.type.toLowerCase())
  );

  if (baseRateItem) {
    const totalBase = baseRateItem.basePrice * nights;
    subtotal += totalBase;
    // Assuming lodging is taxable? Let's assume Yes for simplicity, or check catalog flag in future.
    taxableAmount += totalBase; 
    
    breakdown.push({
      description: `${baseRateItem.name} (${nights} nights)`,
      amount: totalBase,
      quantity: nights
    });
  } else {
    // Fallback if seeded data doesn't match perfectly
    const fallbackPrice = 5500; // $55
    const totalBase = fallbackPrice * nights;
    subtotal += totalBase;
    taxableAmount += totalBase;
    breakdown.push({
      description: `${reservation.type} (Base Rate - ${nights} nights)`,
      amount: totalBase,
      quantity: nights
    });
  }

  // 2. Add Line Items
  for (const item of lineItems) {
    const lineTotal = item.unitPriceCentsSnapshot * item.quantity;
    subtotal += lineTotal;
    if (item.taxableSnapshot) {
      taxableAmount += lineTotal;
    }
    breakdown.push({
      description: item.nameSnapshot || item.description || 'Service',
      amount: lineTotal,
      quantity: item.quantity
    });
  }

  // 3. Calculate Tax
  const tax = Math.round(taxableAmount * (taxRateBps / 10000));

  // 4. Final
  const total = Math.max(0, subtotal + tax - discountCents);

  return {
    subtotal,
    tax,
    discount: discountCents,
    total,
    breakdown
  };
}
