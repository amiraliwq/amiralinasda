"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export default function SignupPage() {
  const [form,setForm]=useState({firstName:"",lastName:"",username:"",phone:"",password:"",confirm:""});
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const router=useRouter();
  const set=(k:string,v:string)=>setForm(x=>({...x,[k]:v}));
  async function submit(e:React.FormEvent){
    e.preventDefault(); setError("");
    if(form.password.length<8) return setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
    if(form.password!==form.confirm) return setError("تکرار رمز عبور یکسان نیست.");
    const phone=form.phone.startsWith("+")?form.phone:form.phone.startsWith("0")?"+98"+form.phone.slice(1):"+98"+form.phone;
    setBusy(true);
    const supabase=createClient();
    const {data,error:authError}=await supabase.auth.signUp({phone,password:form.password});
    if(authError){setError(authError.message);setBusy(false);return;}
    if(data.user){
      const {error:profileError}=await supabase.from("profiles").upsert(
        {id:data.user.id,first_name:form.firstName,last_name:form.lastName,
         full_name:(form.firstName+" "+form.lastName).trim(),username:form.username,phone},
        {onConflict:"id"}
      );
      if(profileError){setError(profileError.message);setBusy(false);return;}
    }
    router.push("/login"); setBusy(false);
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
        <label>شماره تلفن<input required className="mt-2 w-full rounded-2xl border border-slate-200 p-3" dir="ltr" placeholder="0912..." value={form.phone} onChange={e=>set("phone",e.target.value)}/></label>
        <label>رمز عبور<input required type="password" minLength={8} className="mt-2 w-full rounded-2xl border border-slate-200 p-3" dir="ltr" value={form.password} onChange={e=>set("password",e.target.value)}/></label>
        <label>تکرار رمز عبور<input required type="password" className="mt-2 w-full rounded-2xl border border-slate-200 p-3" dir="ltr" value={form.confirm} onChange={e=>set("confirm",e.target.value)}/></label>
        {error&&<div className="sm:col-span-2 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <button disabled={busy} className="sm:col-span-2 rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 p-3 font-bold text-white shadow-lg">{busy?"در حال ثبت‌نام...":"ایجاد حساب"}</button>
      </form>
      <p className="mt-5 text-sm text-slate-500">قبلاً ثبت‌نام کرده‌ای؟ <Link href="/login" className="font-bold text-violet-700">ورود</Link></p>
    </div>
  </main>
}