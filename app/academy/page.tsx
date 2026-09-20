import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
export default async function AcademyPage(){
  const supabase=await createClient();
  const {data:courses}=await supabase.from("courses").select("id,title,slug").eq("published",true).order("created_at",{ascending:false}).limit(12);
  return <main dir="rtl" className="min-h-screen bg-[#f8f7f4]">
    <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5"><Link href="/" className="font-black">فروشگاه و آکادمی امیرعلی</Link><Link href="/login" className="rounded-xl bg-black px-4 py-2 text-sm text-white">ورود</Link></div></header>
    <section className="mx-auto max-w-7xl px-5 py-14">
      <div className="text-sm text-black/45">آکادمی</div><h1 className="mt-2 text-4xl font-black">دوره‌های آموزشی</h1>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(courses||[]).map((c:any)=><Link key={c.id} href={`/academy/${c.slug||c.id}`} className="rounded-3xl bg-white p-6 shadow-sm"><div className="aspect-video rounded-2xl bg-black/5"/><h2 className="mt-5 text-xl font-bold">{c.title||"دوره آموزشی"}</h2></Link>)}
      </div>
      {!courses?.length && <div className="mt-10 rounded-3xl border border-dashed bg-white p-12 text-center text-black/50">دوره منتشرشده‌ای وجود ندارد.</div>}
    </section>
  </main>
}
