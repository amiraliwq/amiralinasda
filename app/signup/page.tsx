"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

function normalizePhone(value: string) {
  const digits = value.replace(/[\s-]/g, "");
  if (/^09\d{9}$/.test(digits)) return "+98" + digits.slice(1);
  if (/^9\d{9}$/.test(digits)) return "+98" + digits;
  if (/^\+989\d{9}$/.test(digits)) return digits;
  return null;
}

function authMessage(message: string) {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists") || m.includes("user already registered"))
    return "این شماره قبلاً ثبت شده است.";
  if (m.includes("phone") && (m.includes("disabled") || m.includes("not enabled")))
    return "ورود و ثبت‌نام با شماره تلفن هنوز در Supabase فعال نشده است.";
  if (m.includes("invalid") && m.includes("phone"))
    return "لطفاً یک شماره تلفن قابل دسترس و معتبر وارد کنید.";
  if (m.includes("password"))
    return "رمز عبور واردشده شرایط لازم را ندارد.";
  return "ثبت‌نام انجام نشد. اطلاعات را بررسی و دوباره تلاش کنید.";
}

export default function SignupPage() {
  const [form,setForm]=useState({firstName:"",lastName:"",username:"",phone:"",password:"",confirm:""});
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const router=useRouter();
  const set=(k:string,v:string)=>setForm(x=>({...x,[k]:v}));

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setError("");
    const phone=normalizePhone(form.phone);
    if(!phone) return setError("لطفاً یک شماره تلفن قابل دسترس و معتبر وارد کنید؛ مثال: 09123456789");
    if(form.password.length<8) return setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
    if(form.password!==form.confirm) return setError("تکرار رمز عبور یکسان نیست.");
    setBusy(true);

    const supabase=createClient();
    const {data,error:authError}=await supabase.auth.signUp({
      phone,
      password:form.password,
      options:{data:{first_name:form.firstName,last_name:form.lastName,username:form.username}}
    });

    if(authError){setError(authMessage(authError.message));setBusy(false);return;}

    if(data.user){
      const {error:profileError}=await supabase.from("profiles").upsert({
        id:data.user.id,
        first_name:form.firstName,
        last_name:form.lastName,
        full_name:(form.firstName+" "+form.lastName).trim(),
        username:form.username,
        phone
      },{onConflict:"id"});
      if(profileError){
        setError(profileError.message.includes("duplicate") ? "این نام کاربری یا شماره قبلاً ثبت شده است." : "حساب ساخته شد اما اطلاعات پروفایل ذخیره نشد.");
        setBusy(false);
        return;
      }
    }

    setBusy(false);
    router.push("/login?registered=1");
  }

  return <main dir="rtl" className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-fuchsia-50 px-4 py-10">
    <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-2xl backdrop-blur sm:p-10">
      <Link href="/" className="text-sm text-violet-700">بازگشت به سایت</Link>
      <h1 className="mt-5 text-3xl font-black text-slate-900">ثبت‌نام</h1>
      <p className="mt-2 text-slate-500">حساب کاربری خودت را بساز و خرید و آموزش را یکجا مدیریت کن.</p>
      <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2">
        <label>نام<input required className="mt-2 w-full rounded-2xl border border-slate-200 p-3" value={form.firstName} onChange={e=>set("firstName",e.target.value)}/></label>
        <label>نام خانوادگی<input required className="mt-2 w-full rounded-2xl border border-slate-200 p-3" value={form.lastName} onChange={e=>set("lastName",e.target.value)}/></label>
        <label>نام کاربری<input required minLength={3} className="mt-2 w-full rounded-2xl border border-slate-200 p-3" dir="ltr" value={form.username} onChange={e=>set("username",e.target.value)}/></label>
        <label>شماره تلفن
          <input required inputMode="tel" autoComplete="tel" className="mt-2 w-full rounded-2xl border border-slate-200 p-3" dir="ltr" placeholder="09123456789" value={form.phone} onChange={e=>set("phone",e.target.value)}/>
          <span className="mt-1 block text-xs text-slate-500">لطفاً یک شماره قابل دسترس وارد کنید؛ برای تأیید حساب ممکن است پیامک ارسال شود.</span>
        </label>
        <label>رمز عبور<input required type="password" minLength={8} autoComplete="new-password" className="mt-2 w-full rounded-2xl border border-slate-200 p-3" dir="ltr" value={form.password} onChange={e=>set("password",e.target.value)}/></label>
        <label>تکرار رمز عبور<input required type="password" autoComplete="new-password" className="mt-2 w-full rounded-2xl border border-slate-200 p-3" dir="ltr" value={form.confirm} onChange={e=>set("confirm",e.target.value)}/></label>
        {error&&<div className="sm:col-span-2 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <button disabled={busy} className="sm:col-span-2 rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 p-3 font-bold text-white shadow-lg disabled:opacity-50">{busy?"در حال ثبت‌نام...":"ایجاد حساب"}</button>
      </form>
      <p className="mt-5 text-sm text-slate-500">قبلاً ثبت‌نام کرده‌ای؟ <Link href="/login" className="font-bold text-violet-700">ورود</Link></p>
    </div>
  </main>
}