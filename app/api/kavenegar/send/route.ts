import { NextRequest, NextResponse } from "next/server";
import { sendKavenegarSms } from "@/lib/kavenegar";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body?.message ?? "").trim();
    const receptor = String(body?.receptor ?? "").trim();
    const sender = body?.sender ? String(body.sender).trim() : undefined;

    if (!message || !receptor) {
      return NextResponse.json({ ok: false, error: "message and receptor are required" }, { status: 400 });
    }

    const result = await sendKavenegarSms({ message, receptor, sender });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Kavenegar send error:", error);
    return NextResponse.json({ ok: false, error: "SMS could not be sent" }, { status: 500 });
  }
}
