import Link from "next/link";
export default function CartPage(){
  return <main dir="rtl" className="grid min-h-screen place-items-center bg-[#f8f7f4] p-6">
    <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-black">سبد خرید</h1>
      <p className="mt-3 text-black/55">سبد خرید به‌صورت مرحله‌ای به Supabase و سفارش واقعی متصل می‌شود.</p>
      <Link href="/" className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-white">بازگشت به فروشگاه</Link>
    </div>
  </main>
}
