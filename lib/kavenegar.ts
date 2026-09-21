import * as Kavenegar from "kavenegar";

export function createKavenegar() {
  const apikey = process.env.KAVENEGAR_API_KEY;
  if (!apikey) throw new Error("KAVENEGAR_API_KEY is not configured");
  return Kavenegar.KavenegarApi({ apikey });
}

export function normalizeIranPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^989\d{9}$/.test(digits)) return "0" + digits.slice(2);
  if (/^9\d{9}$/.test(digits)) return "0" + digits;
  return null;
}

export function sendKavenegarSms(input: {
  message: string;
  receptor: string;
  sender?: string;
}) {
  const sender = input.sender || process.env.KAVENEGAR_SENDER;
  if (!sender) throw new Error("KAVENEGAR_SENDER is not configured");
  const receptor = normalizeIranPhone(input.receptor);
  if (!receptor) throw new Error("Invalid Iranian phone number");

  const api = createKavenegar();
  return new Promise<{ response: unknown; status: unknown }>((resolve, reject) => {
    api.Send({ message: input.message, sender, receptor }, (response: unknown, status: number) => {
      if (Number(status) >= 400) reject(new Error(String(status)));
      else resolve({ response, status });
    });
  });
}