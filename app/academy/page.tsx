"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {createClient} from "../../lib/supabase/client";
import {BookOpen,CalendarDays,CheckCircle2,FileText,Heart,Medal,MessageCircle,LogOut,ShoppingBag,Star,UserRound} from "lucide-react";

export default function AcademyPage(){
  const [courses,setCourses]=useState<any[]>([]);
  const [user,setUser]=useState<any>(null);
  useEffect(()=>{
    const s=createClient();
    s.auth.getUser().then(({data})=>setUser(data.user));
    s.from("courses").select("id,title,slug,cover_url,price,level").eq("published",true).order("created_at",{ascending:false}).limit(8).then(({data})=>setCourses(data||[]));
  },[]);
  const displayName=user?.user_metadata?.full_name||"دانش‌آموز";
  return <main dir="rtl" className="academy-shell">
    <header className="academy-header sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-lg font-black">آکادمی و فروشگاه امیرعلی</Link>
        <div className="flex items-center gap-2">
          <Link href="/products" className="hidden rounded-full bg-black/10 px-4 py-2 text-sm font-bold sm:block">فروشگاه</Link>
          <Link href="/cart" className="rounded-full bg-black/10 p-2"><ShoppingBag size={19}/></Link>
          {user?<button onClick={()=>createClient().auth.signOut().then(()=>location.reload())} className="rounded-full bg-black/10 p-2"><LogOut size={19}/></button>:<Link href="/login" className="rounded-full bg-black/10 px-4 py-2 text-sm font-bold">ورود</Link>}
        </div>
      </div>
    </header>

    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[1fr_350px]">
      <section className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <span className="academy-pill px-5 py-3 text-sm">⚖ قوانین و سوالات متداول</span>
          <span className="academy-pill px-5 py-3 text-sm">▣ راهنمای لایوها</span>
          <span className="academy-pill px-5 py-3 text-sm">⇩ دانلود ابزار</span>
        </div>

        <div className="academy-card p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-black">داشبورد آموزشی</h1>
            <BookOpen className="text-[#cbb2ff]"/>
          </div>
          <div className="academy-card-soft flex items-center justify-between px-5 py-4">
            <span className="text-sm text-white/60">انتخاب دوره</span>
            <select className="bg-transparent font-bold outline-none"><option>همه دوره‌ها</option>{courses.map(c=><option key={c.id}>{c.title}</option>)}</select>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="academy-stat academy-gold"><div className="flex items-center justify-between"><span>امتیاز</span><Star fill="currentColor"/></div><div className="mt-2 text-3xl font-black">۲.۷۱</div></div>
            <div className="academy-stat academy-pink"><div className="flex items-center justify-between"><span>قلب</span><Heart fill="currentColor"/></div><div className="mt-2 text-3xl font-black">۳</div></div>
            <div className="academy-stat academy-purple"><div className="flex items-center justify-between"><span>آموزشگاه</span><UserRound/></div><div className="mt-2 text-xl font-black">آکادمی امیرعلی</div></div>
            <div className="academy-stat academy-blue"><div className="flex items-center justify-between"><span>ترم</span><CalendarDays/></div><div className="mt-2 text-xl font-black">دوره جاری</div></div>
            <div className="academy-stat academy-green"><div className="flex items-center justify-between"><span>وضعیت</span><CheckCircle2/></div><div className="mt-2 text-xl font-black">فعال</div></div>
            <div className="academy-stat academy-gold"><div className="flex items-center justify-between"><span>پروژه</span><FileText/></div><div className="mt-2 text-xl font-black">در انتظار بررسی</div></div>
          </div>
        </div>

        <div className="academy-card p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black">دوره‌های آموزشی</h2><BookOpen className="text-[#cbb2ff]"/></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map(c=><Link key={c.id} href={`/academy?course=${c.slug||c.id}`} className="academy-card-soft overflow-hidden transition hover:-translate-y-1">
              {c.cover_url?<img src={c.cover_url} alt={c.title} className="aspect-video w-full object-cover"/>:<div className="aspect-video bg-gradient-to-br from-[#3b3150] to-[#24212a]"/>}
              <div className="p-4"><div className="text-xs text-[#cbb2ff]">{c.level||"آموزشی"}</div><h3 className="mt-2 font-bold">{c.title}</h3></div>
            </Link>)}
          </div>
          {!courses.length&&<div className="academy-card-soft p-10 text-center text-white/50">هنوز دوره‌ای منتشر نشده است.</div>}
        </div>
      </section>

      <aside className="space-y-5">
        <div className="academy-card p-6 text-center lg:sticky lg:top-24">
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-[#cbb2ff] to-[#8062c9] text-4xl font-black text-[#2a2038]">
            {displayName.slice(0,1)}
          </div>
          <h2 className="mt-5 text-2xl font-black">{displayName}</h2>
          <div className="mt-3 flex justify-center gap-2"><span className="academy-pill px-4 py-2 text-xs">دانش‌آموز</span><span className="rounded-full bg-[#173b34] px-4 py-2 text-xs text-[#5fe0b9]">● فعال</span></div>
          <div className="my-6 border-t border-white/10"/>
          <div className="space-y-4 text-right text-sm text-white/65">
            <div className="flex items-center gap-3"><UserRound size={18}/> پروفایل من</div>
            <div className="flex items-center gap-3"><CalendarDays size={18}/> کلاس‌ها و برنامه</div>
            <div className="flex items-center gap-3"><FileText size={18}/> تکالیف و پروژه‌ها</div>
            <div className="flex items-center gap-3"><Medal size={18}/> مدارک پایان دوره</div>
          </div>
          <Link href="/login" className="mt-6 block rounded-2xl bg-[#332b3f] px-4 py-3 text-[#cdb7ff]">مدیریت حساب</Link>
        </div>
        <div className="academy-card p-5"><div className="flex items-center gap-2 text-lg font-black"><MessageCircle className="text-[#cbb2ff]"/> پشتیبانی</div><p className="mt-3 text-sm leading-7 text-white/55">اگر در دوره یا تکالیف مشکلی داشتی، از بخش پشتیبانی با ما در ارتباط باش.</p></div>
      </aside>
    </div>
    <footer className="border-t border-white/5 py-8 text-center text-sm text-white/35">© آکادمی و فروشگاه امیرعلی</footer>
  </main>