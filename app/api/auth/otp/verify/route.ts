import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeIranPhone } from "@/lib/auth/kavenegar";

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
    const code = String(body?.code ?? "").trim();

    if (!phone || !/^\d{6}$/.test(code) || !["login","signup","admin_login"].includes(purpose)) {
      return NextResponse.json({ok:false,error:"کد تأیید نامعتبر است."},{status:400});
    }
    if (purpose === "admin_login" && phone !== process.env.ADMIN_PHONE) {
      return NextResponse.json({ok:false,error:"کد تأیید نامعتبر است."},{status:401});
    }

    const supabase = createAdminClient();
    const {data:otp,error:readError} = await supabase
      .from("auth_otp_codes")
      .select("id,code_hash,expires_at,attempts")
      .eq("phone",phone).eq("purpose",purpose)
      .is("consumed_at",null)
      .order("created_at",{ascending:false}).limit(1).maybeSingle();

    if (readError || !otp || new Date(otp.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ok:false,error:"کد منقضی یا نامعتبر است."},{status:401});
    }

    if (otp.attempts >= 8) {
      return NextResponse.json({ok:false,error:"تعداد تلاش‌های مجاز تمام شده است."},{status:429});
    }

    if (hashCode(phone,purpose,code) !== otp.code_hash) {
      await supabase.from("auth_otp_codes").update({attempts:otp.attempts+1}).eq("id",otp.id);
      return NextResponse.json({ok:false,error:"کد تأیید اشتباه است."},{status:401});
    }

    await supabase.from("auth_otp_codes").update({consumed_at:new Date().toISOString()}).eq("id",otp.id);

    if (purpose !== "admin_login") {
      return NextResponse.json({ok:true,verified:true});
    }

    const email = `phone-${phone.replace(/^0/,"")}@auth.amirali-razi-iran.local`;
    let {data:userData,error:userError} = await supabase.auth.admin.listUsers({page:1,perPage:1000});
    const existing = userData?.users.find(u=>u.email===email);

    let userId = existing?.id;
    if (!userId) {
      const created = await supabase.auth.admin.createUser({
        email,
        email_confirm:true,
        user_metadata:{phone,role:"admin"}
      });
      if (created.error || !created.data.user) throw created.error || new Error("admin user creation failed");
      userId = created.data.user.id;
    }

    const {error:profileError} = await supabase.from("profiles").upsert({
      id:userId,phone,role:"admin",full_name:"امیرعلی"
    },{onConflict:"id"});
    if (profileError) throw profileError;

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
    const generated = await supabase.auth.admin.generateLink({
      type:"magiclink",
      email,
      options: origin ? {redirectTo:`${origin}/admin`} : undefined
    });
    if (generated.error) throw generated.error;

    const link = generated.data?.properties?.action_link;
    if (!link) throw new Error("Could not create admin session link");

    return NextResponse.json({ok:true,verified:true,actionLink:link});
  } catch (error) {
    console.error("OTP verify error",error);
    return NextResponse.json({ok:false,error:"تأیید ورود انجام نشد."},{status:500});
  }
}
