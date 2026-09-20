"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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

function persianSignupError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists") || m.includes("duplicate")) {
    return "این شماره قبلاً ثبت شده است. لطفاً یک شماره قابل دسترس وارد کنید.";
  }
  if (m.includes("phone logins are disabled")) return "ثبت‌نام با شماره تماس در Supabase فعال نشده است.";
  if (m.includes("password")) return "رمز عبور باید حداقل ۶ کاراکتر باشد.";
  if (m.includes("too many requests")) return "تعداد درخواست‌ها زیاد شده است. چند دقیقه بعد دوباره تلاش کنید.";
  return "ثبت‌نام انجام نشد. اطلاعات واردشده را بررسی کنید.";
}

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", username: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") || "/" : "/";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const phone = normalizePhone(form.phone);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.username.trim()) {
      setError("نام، نام خانوادگی و نام کاربری را کامل کنید.");
      return;
    }
    if (!/^\+989\d{9}$/.test(phone)) {
      setError("لطفاً یک شماره تماس قابل دسترس و معتبر وارد کنید؛ نمونه: 09364601110");
      return;
    }
    if (form.password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("تکرار رمز عبور با رمز عبور یکسان نیست.");
      return;
    }

    setBusy(true);
    const { data, error } = await createClient().auth.signUp({
      phone,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          full_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
          username: form.username.trim(),
        },
      },
    });

    if (error) {
      setError(persianSignupError(error.message));
    } else if (data.session) {
      router.push(next);
    } else {
      setSuccess(`ثبت‌نام با موفقیت ایجاد شد. زمان ثبت‌نام: ${new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date())}. اگر تأیید شماره فعال باشد، کد تأیید برای شما ارسال می‌شود.`);
    }
    setBusy(false);
  }

  const field = (key: keyof typeof form, label: string, placeholder = "") => (
    <label className="block text-sm font-medium">
      {label}
      <input required value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" />
    </label>
  );

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-br from-[#f5f0ff] via-white to-[#eef4ff] p-5 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-purple-100 bg-white p-7 shadow-xl shadow-purple-100/60">
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-sm font-medium text-purple-700">← بازگشت به ورود</Link>
        <div className="mt-6 rounded-2xl bg-gradient-to-l from-purple-600 to-indigo-600 p-5 text-white">
          <div className="text-sm text-white/75">فروشگاه و آکادمی امیرعلی</div>
          <h1 className="mt-2 text-3xl font-black">ساخت حساب کاربری</h1>
          <p className="mt-2 text-sm text-white/80">شماره تماس واقعی و قابل دسترس وارد کنید.</p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {field("firstName", "نام", "امیرعلی")}
          {field("lastName", "نام خانوادگی", "رضایی")}
          {field("username", "نام کاربری", "amirali")}
          {field("phone", "شماره تماس", "09364601110")}
          {field("password", "رمز عبور")}
          {field("confirm", "تکرار رمز عبور")}
        </div>

        {error && <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-3 text-sm leading-7 text-green-700">{success}</div>}

        <button onClick={submit as any} disabled={busy} className="mt-6 w-full rounded-xl bg-purple-600 p-3 font-bold text-white transition hover:bg-purple-700 disabled:opacity-50">
          {busy ? "در حال ثبت‌نام..." : "ثبت‌نام"}
        </button>
      </div>
    </main>
  );
}
