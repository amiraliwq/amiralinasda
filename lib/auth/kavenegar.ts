import * as Kavenegar from "kavenegar";

export function normalizeIranPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^989\d{9}$/.test(digits)) return "0" + digits.slice(2);
  if (/^9\d{9}$/.test(digits)) return "0" + digits;
  return null;
}

export async function sendKavenegarSms(receptor: string, message: string) {
  const apikey = process.env.KAVENEGAR_API_KEY;
  const sender = process.env.KAVENEGAR_SENDER || "2000660110";
  if (!apikey) throw new Error("KAVENEGAR_API_KEY is not configured");

  const api = Kavenegar.KavenegarApi({ apikey });
  return new Promise((resolve, reject) => {
    api.Send({ message, sender, receptor }, (response: unknown, status: unknown, messageText: unknown) => {
      if (Number(status) !== 200) {
        reject(new Error(String(messageText || "Kavenegar rejected the request")));
        return;
      }
      resolve(response);
    });
  });
}
