"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

function normalizePhone(value: string) {
  const digits = value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[^0-9+]/g, "");
  if (digits.startsWith("09")) return "+98" + digits.slice(1);
  if (digits.startsWith("98")) return "+" + digits;
  return digits;
}

function persianAuthError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("phone logins are disabled")) return "ورود با شماره تماس در Supabase فعال نشده است.";
  if (m.includes("invalid login credentials")) return "شماره تماس یا رمز عبور نادرست است.";
  if (m.includes("phone not confirmed")) return "شماره تماس شما هنوز تأیید نشده است.";
  if (m.includes("too many requests")) return "تعداد تلاش‌ها زیاد شده است. چند دقیقه بعد دوباره تلاش کنید.";
  return "ورود انجام نشد. اطلاعات واردشده را بررسی کنید.";
}

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const normalized = normalizePhone(phone);

    if (!/^\+989\d{9}$/.test(normalized)) {
      setError("لطفاً یک شماره تماس قابل دسترس و معتبر وارد کنید؛ نمونه: 09364601110");
      setBusy(false);
      return;
    }

    const { error } = await createClient().auth.signInWithPassword({
      phone: normalized,
      password,
    });

    if (error) setError(persianAuthError(error.message));
    else {
      const { data: profile } = await createClient().from("profiles").select("role").single();
      router.push(profile?.role === "admin" ? "/admin" : next);
    }
    setBusy(false);
  }

  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-gradient-to-br from-[#f5f0ff] via-white to-[#eef4ff] p-5">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-purple-100 bg-white p-7 shadow-xl shadow-purple-100/60">
        <Link href="/" className="text-sm font-medium text-purple-700">← بازگشت به سایت</Link>
        <div className="mt-6 rounded-2xl bg-gradient-to-l from-purple-600 to-indigo-600 p-5 text-white">
          <div className="text-sm text-white/75">فروشگاه و آکادمی امیرعلی</div>
          <h1 className="mt-2 text-3xl font-black">ورود به حساب</h1>
          <p className="mt-2 text-sm text-white/80">برای خرید، دوره‌ها و حساب کاربری وارد شوید.</p>
        </div>

        <label className="mt-7 block text-sm font-medium">شماره تماس
          <input required inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            placeholder="09364601110" dir="ltr" />
        </label>

        <label className="mt-4 block text-sm font-medium">رمز عبور
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            dir="ltr" />
        </label>

        {error && <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <button disabled={busy} className="mt-6 w-full rounded-xl bg-purple-600 p-3 font-bold text-white transition hover:bg-purple-700 disabled:opacity-50">
          {busy ? "در حال ورود..." : "ورود"}
        </button>

        <p className="mt-5 text-center text-sm text-gray-500">
          حساب ندارید؟ <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-bold text-purple-700">ثبت‌نام کنید</Link>
        </p>
      </form>
    </main>
  );
}
