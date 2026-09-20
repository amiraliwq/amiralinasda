import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { ShoppingBag } from "lucide-react";

export default async function ProductsPage(){
  const supabase=await createClient();
  const {data:products}=await supabase.from("products").select("id,title,slug,price,image_url,category,featured").eq("active",true).order("featured",{ascending:false}).order("created_at",{ascending:false});
  return <main dir="rtl" className="min-h-screen bg-[#f8f7f4]">
    <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5"><Link href="/" className="font-black">فروشگاه و آکادمی امیرعلی</Link><div className="flex gap-2"><Link href="/login" className="rounded-xl border px-4 py-2 text-sm">ورود</Link><Link href="/cart" className="rounded-xl bg-black px-4 py-2 text-sm text-white">سبد خرید</Link></div></div></header>
    <section className="mx-auto max-w-7xl px-5 py-14">
      <div className="text-sm text-black/45">فروشگاه</div><h1 className="mt-2 text-4xl font-black">همه محصولات</h1>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {(products||[]).map((p:any)=><Link key={p.id} href={`/products/${p.slug||p.id}`} className="rounded-3xl bg-white p-4 shadow-sm transition hover:-translate-y-1">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[#f1f0ec]">{p.image_url?<img src={p.image_url} alt={p.title||"محصول"} className="h-full w-full object-cover"/>:<ShoppingBag className="text-black/20" size={42}/>}</div>
          <div className="mt-4 text-xs text-black/40">{p.category}</div><h2 className="mt-1 font-bold">{p.title}</h2><div className="mt-2 font-black">{Number(p.price||0).toLocaleString("fa-IR")} تومان</div>
        </Link>)}
      </div>
      {!products?.length && <div className="mt-10 rounded-3xl border border-dashed bg-white p-12 text-center text-black/50">محصول فعالی وجود ندارد.</div>}
    </section>
  </main>
}