export function mylerzStatusKind(status: string) {
  const value = status.trim().toLowerCase();
  if (/cancel|ملغي|إلغاء/.test(value)) return "cancelled";
  if (
    /^(?:confirmed\s+)?delivered(?:\s+to\s+consignee)?$|^(?:delivery\s+)?confirmed$|^(?:تم\s+)?(?:تأكيد\s+)?(?:تسليم|توصيل)(?:\s+الشحنة)?$/.test(
      value,
    )
  )
    return "delivered";
  if (/return|fail|undeliver|not deliver|تعذر|مرتجع|لم يتم/.test(value))
    return "exception";
  if (/out for|transit|picked|قيد التوصيل/.test(value)) return "shipped";
  return "processing";
}

export function mylerzStatusLabel(status: string, lang: "ar" | "en" = "ar") {
  const labels = {
    delivered: { ar: "تم التسليم", en: "Delivered" },
    cancelled: { ar: "ملغي", en: "Cancelled" },
    exception: {
      ar: "تعذر التسليم / مرتجع",
      en: "Delivery exception / return",
    },
    shipped: { ar: "قيد التوصيل", en: "In transit" },
    processing: { ar: "قيد التجهيز", en: "Processing" },
  };
  return labels[mylerzStatusKind(status)][lang];
}
