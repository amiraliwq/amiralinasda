import { NextRequest, NextResponse } from "next/server";
import Kavenegar from "kavenegar";

export const runtime = "nodejs";

function getApi() {
  const apikey = process.env.KAVENEGAR_API_KEY;
  if (!apikey) throw new Error("KAVENEGAR_API_KEY is not configured");
  return Kavenegar.KavenegarApi({ apikey });
}

function normalizeIranPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^989\d{9}$/.test(digits)) return "0" + digits.slice(2);
  if (/^9\d{9}$/.test(digits)) return "0" + digits;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const receptor = normalizeIranPhone(String(body?.receptor ?? ""));
    const message = String(body?.message ?? "").trim();
    const sender = String(body?.sender ?? process.env.KAVENEGAR_SENDER ?? "").trim();

    if (!receptor || !message || !sender) {
      return NextResponse.json(
        { ok: false, error: "receptor, message and sender are required" },
        { status: 400 }
      );
    }

    const api = getApi();

    const result = await new Promise<{ response: unknown; status: unknown }>((resolve, reject) => {
      api.Send(
        { message, sender, receptor },
        (response: unknown, status: unknown) => resolve({ response, status })
      );
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Kavenegar send error:", error);
    return NextResponse.json(
      { ok: false, error: "SMS could not be sent" },
      { status: 500 }
    );
  }
}
