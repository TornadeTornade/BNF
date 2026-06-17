import { randomBytes } from "crypto";

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 6;

export function generateChequeCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  return Array.from(bytes, (byte) => CODE_CHARS[byte % CODE_CHARS.length]).join(
    "",
  );
}
