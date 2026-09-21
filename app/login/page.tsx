"use client";

import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "../../lib/supabase/client";
import Link from "next/link";

function normalizePhone(value:string){
  const digits=value.replace(/\D/g,"");
  if(/^09\d{9}$/.test(digits)) return "+98"+digits.slice(1);
  if(/^9\d{9}$/.test(digits)) return "+98"+digits;
  if(/^98\d{10}$/.test(digits)) return "+"+digits;
  return null;
}
function emailFor(phone:string){ return `phone-${phone.replace(/^\+98/,"")}@auth.amirali-razi-iran.local`; }
function messageFor(error:string){
  const m=error.toLowerCase();
  if(m.includes("invalid login credentials")) return "شماره تلفن یا رمز عبور اشتباه است.";
  if(m.includes("email not confirmed")) return "حساب شما هنوز تأیید نشده است.";
  if(m.includes("too many requests")) return "تعداد تلاش‌ها زیاد شده است؛ کمی بعد دوباره امتحان کنید.";
  return "ورود انجام نشد. شماره و رمز عبور را بررسی کنید.";
}

export default function LoginPage(){
  const [phone,setPhone]=useState("");
  const [password,setPassword]=useState("");
  const [code,setCode]=useState("");
  const [otpSent,setOtpSent]=useState(false);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const router=useRouter();
  const [search,setSearch]=useState("");
  useEffect(()=>{setSearch(window.location.search)},[]);
  const params=new URLSearchParams(search);
  const next=params.get("next")||"/";
  const adminFlow=next.startsWith("/admin");

  async function submitPassword(e:React.FormEvent){
    e.preventDefault();setBusy(true);setError("");
    const normalized=normalizePhone(phone);
    if(!normalized){setError("شماره موبایل را به شکل 09123456789 وارد کنید.");setBusy(false);return;}
    const {error}=await createClient().auth.signInWithPassword({email:emailFor(normalized),password});
    if(error)setError(messageFor(error.message));else router.push(next);
    setBusy(false);
  }

  async function sendOtp(){
    setBusy(true);setError("");
    try{
      const response=await fetch("/api/auth/otp/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,purpose:"admin_login"})});
      const data=await response.json();
      if(!response.ok||!data.ok)setError(data.error||"ارسال کد انجام نشد.");else setOtpSent(true);
    }catch{setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");}
    setBusy(false);
  }

  async function verifyOtp(e:React.FormEvent){
    e.preventDefault();setBusy(true);setError("");
    try{
      const response=await fetch("/api/auth/otp/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,purpose:"admin_login",code})});
      const data=await response.json();
      if(!response.ok||!data.ok){setError(data.error||"کد صحیح نیست.");setBusy(false);return;}
      if(data.actionLink){window.location.href=data.actionLink;return;}
      router.push(next);
    }catch{setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");setBusy(false);}
  }

  return <main dir="rtl" className="grid min-h-screen place-items-center auth-bg p-4 sm:p-6">
    <div className="w-full max-w-md auth-card rounded-[2rem] p-6 sm:p-8">
      <Link href="/" className="font-bold text-violet-700 hover:text-violet-900">← بازگشت به سایت</Link>
      <div className="mt-6">
        <div className="text-sm font-bold text-violet-700">فروشگاه و آکادمی امیرعلی</div>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{adminFlow?"ورود مدیر":"ورود به حساب"}</h1>
        <p className="mt-2 text-base leading-7 text-slate-600">{adminFlow?"کد ورود به شماره مدیر ارسال می‌شود.":"برای خرید، سفارش‌ها و استفاده از آموزش‌ها وارد حساب شوید."}</p>
      </div>

      {adminFlow ? <form onSubmit={verifyOtp}>
        <label className="mt-7 block text-sm font-bold text-slate-800">شماره موبایل
          <input required inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full auth-input rounded-xl p-3" placeholder="09123456789" dir="ltr"/>
        </label>
        {!otpSent ? <button type="button" disabled={busy} onClick={sendOtp} className="mt-5 w-full rounded-xl auth-button p-3 font-bold shadow-lg disabled:opacity-50">{busy?"در حال ارسال...":"ارسال کد ورود با پیامک"}</button>
        : <>
          <label className="mt-4 block text-sm font-bold text-slate-800">کد تأیید
            <input required inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} className="mt-2 w-full auth-input rounded-xl p-3 text-center text-xl tracking-[0.5em]" placeholder="______" dir="ltr"/>
          </label>
          <button disabled={busy} className="mt-5 w-full rounded-xl auth-button p-3 font-bold shadow-lg disabled:opacity-50">{busy?"در حال تأیید...":"تأیید و ورود به پنل"}</button>
          <button type="button" onClick={()=>{setOtpSent(false);setCode("");setError("")}} className="mt-3 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold text-slate-700">تغییر شماره / ارسال دوباره</button>
        </>}
      </form> : <form onSubmit={submitPassword}>
        <label className="mt-7 block text-sm font-bold text-slate-800">شماره موبایل
          <input required inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full auth-input rounded-xl p-3" placeholder="09123456789" dir="ltr"/>
        </label>
        <label className="mt-4 block text-sm font-bold text-slate-800">رمز عبور
          <input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full auth-input rounded-xl p-3" placeholder="رمز عبور خود را وارد کنید" dir="ltr"/>
        </label>
        <button disabled={busy} className="mt-5 w-full rounded-xl auth-button p-3 font-bold shadow-lg disabled:opacity-50">{busy?"در حال ورود...":"ورود به حساب"}</button>
        <p className="mt-5 text-center text-sm text-slate-600">حساب نداری؟ <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-bold text-violet-700">ثبت‌نام</Link></p>
      </form>}

      {params.get("registered")==="1"&&<div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium leading-6 text-emerald-800">ثبت‌نام با موفقیت انجام شد؛ اکنون وارد شوید.</div>}
      {error&&<div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">{error}</div>}
    </div>
  </main>
}
