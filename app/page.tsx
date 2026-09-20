import Link from "next/link";
import { createClient } from "../lib/supabase/server";
import { ArrowLeft, BookOpen, ShoppingBag, Sparkles } from "lucide-react";

type Product = { id:string; name:string|null; slug:string|null; price:number|null; active:boolean|null };

export default async function HomePage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id,name,slug,price,active")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f8f7f4]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-black">فروشگاه و آکادمی امیرعلی</Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="#products">فروشگاه</Link>
            <Link href="#academy">آکادمی</Link>
            <Link href="#about">درباره ما</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl border border-black/10 px-4 py-2 text-sm">ورود</Link>
            <Link href="/cart" className="rounded-xl bg-black px-4 py-2 text-sm text-white">سبد خرید</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-sm">
            <Sparkles size={16} /> فروشگاه + آموزش در یکجا
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            یادگیری، خرید و رشد؛
            <span className="block text-black/55">ساده و فارسی</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/60">
            به فروشگاه و آکادمی امیرعلی خوش آمدید. محصولات و دوره‌های آموزشی را از یک حساب کاربری مدیریت کنید.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#products" className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-white">
              مشاهده محصولات <ArrowLeft size={18} />
            </Link>
            <Link href="#academy" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-6 py-3">
              ورود به آکادمی <BookOpen size={18} />
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] bg-black p-8 text-white shadow-2xl">
          <div className="text-sm text-white/50">امکانات سایت</div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["فروشگاه واقعی","آکادمی و دوره‌ها","پرداخت و سفارش","پنل مدیریت","کلاس آنلاین","تکلیف و پیشرفت"].map(x => (
              <div key={x} className="rounded-2xl border border-white/10 bg-white/5 p-4">{x}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><div className="text-sm text-black/45">فروشگاه</div><h2 className="mt-1 text-3xl font-black">محصولات</h2></div>
          <Link href="/products" className="text-sm underline">مشاهده همه</Link>
        </div>
        {products?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(products as Product[]).map(p => (
              <Link href={`/products/${p.slug || p.id}`} key={p.id} className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm transition hover:-translate-y-1">
                <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#f1f0ec]">
                  <ShoppingBag className="text-black/20" size={42} />
                </div>
                <h3 className="mt-4 font-bold">{p.name || "محصول"}</h3>
                <div className="mt-2 font-black">{Number(p.price || 0).toLocaleString("fa-IR")} تومان</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/10 bg-white p-12 text-center text-black/50">
            محصول فعالی برای نمایش ثبت نشده است.
          </div>
        )}
      </section>

      <section id="academy" className="bg-black py-16 text-white">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl">
            <div className="text-sm text-white/45">آکادمی</div>
            <h2 className="mt-2 text-3xl font-black">دوره‌ها و مسیر یادگیری</h2>
            <p className="mt-4 leading-8 text-white/60">دوره‌ها، درس‌ها، تکالیف و کلاس‌های آنلاین در حساب کاربری شما مدیریت می‌شوند.</p>
            <Link href="/academy" className="mt-7 inline-flex rounded-2xl bg-white px-6 py-3 font-bold text-black">مشاهده آکادمی</Link>
          </div>
        </div>
      </section>

      <footer id="about" className="border-t border-black/5 py-8">
        <div className="mx-auto max-w-7xl px-5 text-sm text-black/45">© فروشگاه و آکادمی امیرعلی</div>
      </footer>
    </main>
  );
}
