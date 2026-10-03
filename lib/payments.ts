import { HttpError } from "./auth";
import { CardInput } from "./validators";

export const DECLINE_CARD = "4000000000000002";

export function cardBrand(number: string) {
  if (/^4/.test(number)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(number)) return "Mastercard";
  if (/^3[47]/.test(number)) return "Amex";
  if (/^6(011|5)/.test(number)) return "Discover";
  return "Card";
}

export function luhn(number: string) {
  let sum = 0;
  let double = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let d = number.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return number.length >= 13 && sum % 10 === 0;
}

export function expiryValid(expiry: string, now = new Date()) {
  const m = /^(\d{2})\s*\/\s*(\d{2}|\d{4})$/.exec(expiry);
  if (!m) return false;
  const month = Number(m[1]);
  const year = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2]);
  if (month < 1 || month > 12) return false;
  return new Date(year, month, 1) > now;
}

/** Simulated gateway: validates like a real processor would, but never contacts one. */
export async function chargeCard(raw: unknown) {
  const card = CardInput.parse(raw);
  if (!/^\d{13,19}$/.test(card.number) || !luhn(card.number)) throw new HttpError(400, "That card number isn't valid.");
  if (!expiryValid(card.expiry)) throw new HttpError(400, "That card has expired or the date is invalid (use MM/YY).");
  const brand = cardBrand(card.number);
  if (!new RegExp(`^\\d{${brand === "Amex" ? 4 : 3}}$`).test(card.cvc)) throw new HttpError(400, "Check the security code (CVC).");
  await new Promise((r) => setTimeout(r, 1200));
  if (card.number === DECLINE_CARD) throw new HttpError(402, "Your card was declined. Try a different card.");
  return { brand, last4: card.number.slice(-4), name: card.name, zip: card.zip };
}

export function confirmationCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `PC-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}
