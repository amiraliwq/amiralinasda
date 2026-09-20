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
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const router=useRouter();
  const params=useSearchParams();
  async function submit(e:any){
    e.preventDefault();setBusy(true);setError("");
    const normalized=normalizePhone(phone);
    if(!normalized){setError("لطفاً یک شماره تلفن قابل دسترس و معتبر وارد کنید.");setBusy(false);return;}
    const {error}=await createClient().auth.signInWithPassword({phone:normalized,password});
    if(error)setError(messageFor(error.message));else router.push("/");
    setBusy(false);
  }
  return <main dir="rtl" className="grid min-h-screen place-items-center bg-gradient-to-br from-violet-50 via-sky-50 to-fuchsia-50 p-6">
    <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
      <Link href="/" className="text-sm text-violet-700">بازگشت به سایت</Link>
      <h1 className="mt-5 text-3xl font-black">ورود به حساب</h1>
      <p className="mt-2 text-black/50">برای خرید و استفاده از آموزش‌ها وارد شوید.</p>
      {params.get("registered")==="1"&&<div className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">ثبت‌نام با موفقیت انجام شد؛ اکنون وارد شوید.</div>}
      <label className="mt-8 block text-sm">شماره موبایل<input required inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="09123456789" dir="ltr"/></label>
      <label className="mt-4 block text-sm">رمز عبور<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border p-3" dir="ltr"/></label>
      {error&&<div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <button disabled={busy} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 p-3 font-bold text-white shadow-lg disabled:opacity-50">{busy?"در حال ورود...":"ورود"}</button>
      <p className="mt-5 text-center text-sm text-slate-500">حساب نداری؟ <Link href="/signup" className="font-bold text-violet-700">ثبت‌نام</Link></p>
    </form>
  </main>
}