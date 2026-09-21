"use client";

import {useState} from "react";
import {useRouter,useSearchParams} from "next/navigation";
import {createClient} from "../../lib/supabase/client";
import Link from "next/link";

function normalizePhone(value:string){
  const digits=value.replace(/[\s-]/g,"");
  if(/^09\d{9}$/.test(digits)) return "+98"+digits.slice(1);
  if(/^9\d{9}$/.test(digits)) return "+98"+digits;
  if(/^\+989\d{9}$/.test(digits)) return digits;
  return null;
}
function messageFor(error:string){
  const m=error.toLowerCase();
  if(m.includes("invalid login credentials")) return "شماره تلفن یا رمز عبور اشتباه است.";
  if(m.includes("phone")&&(m.includes("disabled")||m.includes("not enabled"))) return "ورود با شماره تلفن هنوز در Supabase فعال نشده است.";
  return "ورود انجام نشد. اطلاعات را بررسی کنید.";
}

export default function LoginPage(){
  const [phone,setPhone]=useState("");
  const [password,setPassword]=useState("");
  const [code,setCode]=useState("");
  const [otpSent,setOtpSent]=useState(false);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const router=useRouter();
  const params=useSearchParams();
  const next=params.get("next")||"/";
  const adminFlow=next.startsWith("/admin");

  async function submitPassword(e:any){
    e.preventDefault();setBusy(true);setError("");
    const normalized=normalizePhone(phone);
    if(!normalized){setError("لطفاً یک شماره تلفن معتبر وارد کنید.");setBusy(false);return;}
    const {error}=await createClient().auth.signInWithPassword({phone:normalized,password});
    if(error)setError(messageFor(error.message));else router.push(next);
    setBusy(false);
  }

  async function sendOtp(){
    setBusy(true);setError("");
    const normalized=phone.replace(/\s|-/g,"");
    const response=await fetch("/api/auth/otp/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:normalized,purpose:"admin_login"})});
    const data=await response.json();
    if(!response.ok||!data.ok)setError(data.error||"ارسال کد انجام نشد.");else setOtpSent(true);
    setBusy(false);
  }

  async function verifyOtp(e:any){
    e.preventDefault();setBusy(true);setError("");
    const response=await fetch("/api/auth/otp/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,purpose:"admin_login",code})});
    const data=await response.json();
    if(!response.ok||!data.ok){setError(data.error||"کد صحیح نیست.");setBusy(false);return;}
    if(data.actionLink){window.location.href=data.actionLink;return;}
    router.push(next);
  }

  return <main dir="rtl" className="grid min-h-screen place-items-center auth-bg p-6">
    <div className="w-full max-w-md auth-card rounded-[2rem] p-8 shadow-2xl">
      <Link href="/" className="text-sm text-violet-700">بازگشت به سایت</Link>
      <h1 className="mt-5 text-3xl font-black">{adminFlow?"ورود مدیر":"ورود به حساب"}</h1>
      <p className="mt-2 text-black/50">{adminFlow?"کد ورود به شماره مدیر ارسال می‌شود.":"برای خرید و استفاده از آموزش‌ها وارد شوید."}</p>

      {adminFlow ? <form onSubmit={verifyOtp}>
        <label className="mt-8 block text-sm">شماره موبایل
          <input required inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full auth-input rounded-xl p-3" placeholder="09123456789" dir="ltr"/>
        </label>
        {!otpSent ? <button type="button" disabled={busy} onClick={sendOtp} className="mt-6 w-full rounded-2xl auth-button p-3 font-bold text-white shadow-lg disabled:opacity-50">{busy?"در حال ارسال...":"ارسال کد ورود با پیامک"}</button>
        : <>
          <label className="mt-4 block text-sm">کد تأیید
            <input required inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} className="mt-2 w-full auth-input rounded-xl p-3 text-center text-xl tracking-[0.5em]" placeholder="------" dir="ltr"/>
          </label>
          <button disabled={busy} className="mt-6 w-full rounded-2xl auth-button p-3 font-bold text-white shadow-lg disabled:opacity-50">{busy?"در حال تأیید...":"تأیید و ورود به پنل"}</button>
          <button type="button" onClick={()=>setOtpSent(false)} className="mt-3 w-full rounded-xl border p-3 text-sm">تغییر شماره / ارسال دوباره</button>
        </>}
      </form> : <form onSubmit={submitPassword}>
        <label className="mt-8 block text-sm">شماره موبایل<input required inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full auth-input rounded-xl p-3" placeholder="09123456789" dir="ltr"/></label>
        <label className="mt-4 block text-sm">رمز عبور<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full auth-input rounded-xl p-3" dir="ltr"/></label>
        <button disabled={busy} className="mt-6 w-full rounded-2xl auth-button p-3 font-bold text-white shadow-lg disabled:opacity-50">{busy?"در حال ورود...":"ورود"}</button>
        <p className="mt-5 text-center text-sm text-slate-500">حساب نداری؟ <Link href="/signup" className="font-bold text-violet-700">ثبت‌نام</Link></p>
      </form>}

      {params.get("registered")==="1"&&<div className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">ثبت‌نام با موفقیت انجام شد؛ اکنون وارد شوید.</div>}
      {error&&<div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    </div>
  </main>
}
