import { NextRequest, NextResponse } from "next/server";
import { randomInt, createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeIranPhone, sendKavenegarSms } from "@/lib/auth/kavenegar";

export const runtime = "nodejs";

function hashCode(phone:string, purpose:string, code:string) {
  const pepper = process.env.OTP_PEPPER || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createHash("sha256").update(`${phone}:${purpose}:${code}:${pepper}`).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = normalizeIranPhone(String(body?.phone ?? ""));
    const purpose = String(body?.purpose ?? "login");

    if (!phone || !["login","signup","admin_login"].includes(purpose)) {
      return NextResponse.json({ok:false,error:"اطلاعات OTP نامعتبر است."},{status:400});
    }

    if (purpose === "admin_login" && phone !== process.env.ADMIN_PHONE) {
      return NextResponse.json({ok:true,message:"اگر شماره مجاز باشد کد ارسال می‌شود."});
    }

    const supabase = createAdminClient();
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await supabase
      .from("auth_otp_codes")
      .select("id",{count:"exact",head:true})
      .eq("phone",phone)
      .eq("purpose",purpose)
      .gte("created_at",since);

    if ((count ?? 0) > 0) {
      return NextResponse.json({ok:false,error:"لطفاً کمی صبر کنید و دوباره درخواست دهید."},{status:429});
    }

    const code = String(randomInt(100000,1000000));
    const { error:insertError } = await supabase.from("auth_otp_codes").insert({
      phone,purpose,code_hash:hashCode(phone,purpose,code),
      expires_at:new Date(Date.now()+120_000).toISOString()
    });
    if (insertError) throw insertError;

    await sendKavenegarSms(phone,`کد ورود شما: ${code}\nفروشگاه و آکادمی امیرعلی`);
    return NextResponse.json({ok:true,message:"کد تأیید ارسال شد."});
  } catch (error) {
    console.error("OTP send error",error);
    return NextResponse.json({ok:false,error:"ارسال کد انجام نشد."},{status:500});
  }
}
