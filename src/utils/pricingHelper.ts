import { ServiceDetail, SubServiceOption } from '../types/services';

export interface CalculatedPrice {
  basePrice: number;
  additionalFee: number;
  total: number;
  isFree: boolean;
  currency: string;
  label: string;
  description: string;
  originalPrice?: number;
  discountedPrice?: number;
}

/**
 * Calculates the exact dynamic fee for a service and optionally selected sub-service.
 * Follows the Super Admin configured pricing model:
 * - 'subservice_based' (default): charges the specific price of the selected sub-service.
 * - 'service_based': charges the flat parent service price.
 * - 'service_plus_fee': charges parent service price + additional processing fee.
 * - 'free': free statutory facilitation (₹0).
 */
export function calculateServicePrice(
  service?: ServiceDetail | null,
  subServiceValue?: string
): CalculatedPrice {
  const currency = service?.currency || '₹';
  const label = service?.priceLabel || 'Service Processing Fee';
  const description = service?.priceDescription || 'Complete your application and document submission.';

  if (!service) {
    return {
      basePrice: 50,
      additionalFee: 0,
      total: 50,
      isFree: false,
      currency: '₹',
      label: 'Service Processing Fee',
      description: 'Standard statutory application fee.'
    };
  }

  // 1. If pricing is disabled or service is free
  if (service.pricingEnabled === false || service.pricingModel === 'free') {
    return {
      basePrice: 0,
      additionalFee: 0,
      total: 0,
      isFree: true,
      currency,
      label: service.priceLabel || 'Free Statutory Assistance',
      description: service.priceDescription || 'No facilitation fee is charged for this service.'
    };
  }

  const additionalFee = Math.max(0, Number(service.additionalFee || 0));

  // 2. Fixed service-level pricing
  if (service.pricingModel === 'service_based' || service.pricingModel === 'service_plus_fee') {
    const basePrice = Math.max(0, Number(service.servicePrice !== undefined ? service.servicePrice : 50));
    const total = basePrice + additionalFee;
    return {
      basePrice,
      additionalFee,
      total,
      isFree: total === 0,
      currency,
      label,
      description,
      originalPrice: service.originalPrice,
      discountedPrice: service.discountedPrice
    };
  }

  // 3. Sub-service level pricing (default model)
  const subService = service.subServices?.find(s => s.value === subServiceValue);
  let basePrice = 50;

  if (subService && subService.price !== undefined && subService.price !== null) {
    basePrice = Math.max(0, Number(subService.price));
  } else if (service.servicePrice !== undefined && service.servicePrice !== null) {
    basePrice = Math.max(0, Number(service.servicePrice));
  }

  const total = basePrice + additionalFee;

  return {
    basePrice,
    additionalFee,
    total,
    isFree: total === 0,
    currency,
    label,
    description,
    originalPrice: subService?.originalPrice || service.originalPrice,
    discountedPrice: service.discountedPrice
  };
}

/**
 * Returns starting price display for catalog, cards, and banners.
 */
export function getStartingPrice(service: ServiceDetail): { amount: number; isFree: boolean; formatted: string } {
  if (service.pricingEnabled === false || service.pricingModel === 'free') {
    return { amount: 0, isFree: true, formatted: 'Free' };
  }

  if (service.pricingModel === 'service_based' || service.pricingModel === 'service_plus_fee') {
    const amt = (service.servicePrice ?? 50) + (service.additionalFee ?? 0);
    return { amount: amt, isFree: amt === 0, formatted: amt === 0 ? 'Free' : `₹${amt}` };
  }

  const activeSubs = (service.subServices || []).filter(s => s.isActive !== false && s.price !== undefined);
  if (activeSubs.length > 0) {
    const minPrice = Math.min(...activeSubs.map(s => Number(s.price || 0)));
    const total = minPrice + (service.additionalFee || 0);
    return {
      amount: total,
      isFree: total === 0,
      formatted: total === 0 ? 'Free' : `₹${total}`
    };
  }

  const defAmt = (service.servicePrice ?? 50) + (service.additionalFee ?? 0);
  return { amount: defAmt, isFree: defAmt === 0, formatted: defAmt === 0 ? 'Free' : `₹${defAmt}` };
}
