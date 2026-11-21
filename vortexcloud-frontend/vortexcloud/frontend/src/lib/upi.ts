// Merchant & support configuration for the UPI checkout flow.
export const MERCHANT_UPI_ID = "krishna6367296002-7@okaxis";
export const MERCHANT_NAME = "Krishna";
export const TELEGRAM_LINK = "https://t.me/Hunter_38";
export const TELEGRAM_HANDLE = "@Hunter_38";

// Booking hand-off countdown (seconds) shown after the UTR is submitted.
export const VERIFY_SECONDS = 60;

export function buildUpiLink(amount: number, note: string): string {
  return `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI_ID)}&pn=${encodeURIComponent(
    MERCHANT_NAME,
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
}
