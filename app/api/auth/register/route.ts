import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeIranPhone } from "@/lib/auth/kavenegar";

export const runtime = "nodejs";
const emailFor = (phone:string) => `phone-${phone.replace(/^0/,"")}@auth.amirali-razi-iran.local`;

export async function POST(request:NextRequest){
  try{
    const body=await request.json();
    const firstName=String(body?.firstName??"").trim();
    const lastName=String(body?.lastName??"").trim();
    const username=String(body?.username??"").trim();
    const phone=normalizeIranPhone(String(body?.phone??""));
    const password=String(body?.password??"");
    if(!firstName||!lastName||!username||!phone||password.length<6)
      return NextResponse.json({ok:false,error:"اطلاعات ثبت‌نام کامل یا معتبر نیست."},{status:400});
    const supabase=createAdminClient();
    const existing=await supabase.from("profiles").select("id,phone,username").or(`phone.eq.${phone},username.eq.${username}`).limit(1).maybeSingle();
    if(existing.error) throw existing.error;
    if(existing.data?.phone===phone) return NextResponse.json({ok:false,error:"این شماره قبلاً ثبت شده است."},{status:409});
    if(existing.data?.username===username) return NextResponse.json({ok:false,error:"این نام کاربری قبلاً استفاده شده است."},{status:409});
    const created=await supabase.auth.admin.createUser({
      email:emailFor(phone),password,email_confirm:true,
      user_metadata:{first_name:firstName,last_name:lastName,full_name:`${firstName} ${lastName}`,username,phone}
    });
    if(created.error||!created.data.user) return NextResponse.json({ok:false,error:"ساخت حساب انجام نشد."},{status:400});
    const profile=await supabase.from("profiles").insert({id:created.data.user.id,first_name:firstName,last_name:lastName,full_name:`${firstName} ${lastName}`,username,phone,role:"customer"});
    if(profile.error){await supabase.auth.admin.deleteUser(created.data.user.id);throw profile.error;}
    return NextResponse.json({ok:true});
  }catch(error){console.error("register error",error);return NextResponse.json({ok:false,error:"ثبت‌نام انجام نشد."},{status:500});}
}