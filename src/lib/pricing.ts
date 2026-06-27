export interface PricedQuantity {
  price: number;
  quantity: number;
}

export function getVolumeDiscountRate(quantity: number): number {
  if (quantity >= 3) return 0.15;
  if (quantity >= 2) return 0.1;
  return 0;
}

export function getVolumeDiscountUnits(quantity: number): number {
  if (quantity >= 3) return 3;
  if (quantity >= 2) return 2;
  return 0;
}

export function calcVolumeDiscountAmount(
  price: number,
  quantity: number,
): number {
  return (
    Math.round(
      price *
        getVolumeDiscountUnits(quantity) *
        getVolumeDiscountRate(quantity) *
        100,
    ) / 100
  );
}

export function calcDiscountedLineTotal(
  price: number,
  quantity: number,
): number {
  return Math.round((price * quantity - calcVolumeDiscountAmount(price, quantity)) * 100) / 100;
}

export function calcItemsSubtotal<T extends PricedQuantity>(items: T[]): number {
  return Math.round(items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) * 100) / 100;
}

export function calcVolumeDiscount<T extends PricedQuantity>(items: T[]): number {
  return Math.round(
    items.reduce(
      (sum, item) => sum + calcVolumeDiscountAmount(Number(item.price), item.quantity),
      0,
    ) * 100,
  ) / 100;
}
