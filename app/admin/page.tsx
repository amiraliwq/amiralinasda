"use client";
import {useEffect,useMemo,useState} from "react";
import {createClient} from "../../lib/supabase/client";
import {AlertTriangle,BookOpen,Box,ChevronLeft,ClipboardList,CreditCard,FileText,LayoutDashboard,LogOut,Package,Settings,ShoppingBag,Users,Wallet} from "lucide-react";

type Metric={label:string,value:number,icon:React.ReactNode,href:string};
const nav=[["داشبورد","/admin",LayoutDashboard],["سفارش‌ها","/admin/orders",ShoppingBag],["پرداخت‌ها","/admin/payments",CreditCard],["محصولات","/admin/products",Package],["دسته‌بندی‌ها","/admin/categories",Box],["کاربران","/admin/users",Users],["دوره‌ها","/admin/courses",BookOpen],["تکالیف","/admin/assignments",ClipboardList],["کلاس‌های آنلاین","/admin/classes",Wallet],["وبلاگ","/admin/blog",FileText],["رسانه‌ها","/admin/media",Box],["تنظیمات","/admin/settings",Settings]] as const;

export default function AdminDashboard(){
 const supabase=useMemo(()=>createClient(),[]);
 const [loading,setLoading]=useState(true); const [allowed,setAllowed]=useState(false); const [metrics,setMetrics]=useState<Metric[]>([]);
 const [recent,setRecent]=useState<any[]>([]); const [error,setError]=useState("");
 useEffect(()=>{(async()=>{
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){location.href="/login?next=/admin";return}
  const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();
  if(profile?.role!=="admin"){setError("دسترسی غیرمجاز");setLoading(false);return}
  setAllowed(true);
  const [orders,recentOrders,pending,users,products,courses,enrollments,assignments,posts]=await Promise.all([
   supabase.from("orders").select("id",{count:"exact",head:true}),
   supabase.from("orders").select("id,total,status,created_at").order("created_at",{ascending:false}).limit(8),
   supabase.from("payments").select("id",{count:"exact",head:true}).in("status",["pending","review"]),
   supabase.from("profiles").select("id",{count:"exact",head:true}),
   supabase.from("products").select("id",{count:"exact",head:true}).eq("active",true),
   supabase.from("courses").select("id",{count:"exact",head:true}).eq("published",true),
   supabase.from("enrollments").select("id",{count:"exact",head:true}),
   supabase.from("assignment_submissions").select("id",{count:"exact",head:true}).eq("status","submitted"),
   supabase.from("blog_posts").select("id",{count:"exact",head:true}).eq("published",true)
  ]);
  setRecent(recentOrders.data??[]);
  setMetrics([
   {label:"سفارش‌ها",value:orders.count??0,icon:<ShoppingBag/>,href:"/admin/orders"},
   {label:"پرداخت‌های در انتظار",value:pending.count??0,icon:<CreditCard/>,href:"/admin/payments"},
   {label:"کاربران",value:users.count??0,icon:<Users/>,href:"/admin/users"},
   {label:"محصولات فعال",value:products.count??0,icon:<Package/>,href:"/admin/products"},
   {label:"دوره‌های منتشرشده",value:courses.count??0,icon:<BookOpen/>,href:"/admin/courses"},
   {label:"ثبت‌نام دوره",value:enrollments.count??0,icon:<Wallet/>,href:"/admin/courses"},
   {label:"تکالیف نیازمند بررسی",value:assignments.count??0,icon:<ClipboardList/>,href:"/admin/assignments"},
   {label:"مقالات منتشرشده",value:posts.count??0,icon:<FileText/>,href:"/admin/blog"}
  ]);
  setLoading(false);
 })()},[supabase]);
 async function logout(){await supabase.auth.signOut();location.href="/login"}
 if(loading)return <main className="admin-shell p-6"><div className="mx-auto max-w-7xl animate-pulse"><div className="h-20 rounded-2xl bg-gray-200"/><div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="h-32 rounded-2xl bg-gray-200"/>)}</div></div></main>;
 if(!allowed)return <main className="grid min-h-screen place-items-center bg-gray-50 p-6"><div className="admin-card max-w-md p-8 text-center"><AlertTriangle className="mx-auto mb-4 text-red-500"/><h1 className="text-xl font-bold">403 - دسترسی غیرمجاز</h1><p className="mt-2 text-gray-500">{error}</p><a className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-white" href="/">بازگشت به سایت</a></div></main>;
 return <main className="admin-shell"><div className="mx-auto flex max-w-[1500px] gap-5 p-4 lg:p-6">
  <aside className="hidden w-64 shrink-0 rounded-3xl bg-[#111] p-4 text-white lg:block"><div className="mb-7 flex items-center gap-3 border-b border-white/10 pb-5"><img src="https://zhexlpaugdnhnbylpoda.supabase.co/storage/v1/object/public/site-assets/branding/logo-1789562479843.png" className="h-12 w-12 rounded-xl bg-white object-contain"/><div><b>امیرعلی</b><div className="text-xs text-white/50">مدیریت سایت</div></div></div><nav className="space-y-1">{nav.map(([label,href,Icon])=><a key={href} href={href} className={href==="/admin"?"flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-sm":"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"}><Icon size={18}/>{label}</a>)}</nav><button onClick={logout} className="mt-6 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 hover:bg-red-500/10"><LogOut size={18}/>خروج</button></aside>
  <section className="min-w-0 flex-1"><header className="admin-card flex items-center justify-between p-4"><div><div className="text-sm text-gray-500">پنل مدیریت</div><h1 className="mt-1 text-2xl font-black">داشبورد</h1></div><div className="flex gap-2"><a href="/" className="rounded-xl border px-4 py-2 text-sm">مشاهده سایت</a><button onClick={logout} className="rounded-xl bg-black px-4 py-2 text-sm text-white lg:hidden">خروج</button></div></header>
   <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">{metrics.map(m=><a href={m.href} key={m.label} className="admin-card p-5 transition hover:-translate-y-0.5"><div className="mb-4 flex items-center justify-between"><span className="rounded-xl bg-gray-100 p-2">{m.icon}</span><ChevronLeft size={16} className="text-gray-400"/></div><div className="text-3xl font-black">{m.value.toLocaleString("fa-IR")}</div><div className="mt-1 text-sm text-gray-500">{m.label}</div></a>)}</div>
   <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]"><div className="admin-card overflow-hidden"><div className="border-b p-5"><h2 className="font-bold">آخرین سفارش‌ها</h2></div><div className="overflow-x-auto"><table className="w-full text-right text-sm"><thead className="bg-gray-50 text-gray-500"><tr><th className="p-4">شناسه</th><th className="p-4">مبلغ</th><th className="p-4">وضعیت</th><th className="p-4">تاریخ</th></tr></thead><tbody>{recent.map(o=><tr key={o.id} className="border-t"><td className="p-4 font-mono">{o.id.slice(0,8)}</td><td className="p-4">{Number(o.total).toLocaleString("fa-IR")} تومان</td><td className="p-4">{o.status}</td><td className="p-4">{new Date(o.created_at).toLocaleDateString("fa-IR")}</td></tr>)}</tbody></table>{!recent.length&&<div className="p-8 text-center text-gray-500">هنوز سفارشی ثبت نشده است.</div>}</div></div>
   <div className="admin-card p-5"><h2 className="font-bold">دسترسی سریع</h2><div className="mt-4 grid gap-3">{[["محصول جدید","/admin/products/new"],["بررسی پرداخت‌ها","/admin/payments"],["مقاله جدید","/admin/blog/new"],["دوره جدید","/admin/courses/new"]].map(([x,h])=><a href={h} key={h} className="flex items-center justify-between rounded-xl border p-3 hover:bg-gray-50"><span>{x}</span><ChevronLeft size={17}/></a>)}</div></div></div>
  </section></div></main>
}