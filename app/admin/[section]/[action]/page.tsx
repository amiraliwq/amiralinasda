import Link from "next/link";

export default async function AdminActionPage({ params }: { params: Promise<{ section: string; action: string }> }) {
  const { section, action } = await params;
  const labels: Record<string,string> = { products: "محصول", payments: "پرداخت", blog: "مقاله", courses: "دوره" };
  const label = labels[section];
  if (!label || action !== "new") {
    return <main className="grid min-h-screen place-items-center p-6"><div className="admin-card p-8 text-center"><h1 className="text-xl font-bold">صفحه پیدا نشد</h1><Link className="mt-4 inline-block text-purple-700" href="/admin">بازگشت به مدیریت</Link></div></main>;
  }
  return <main dir="rtl" className="grid min-h-screen place-items-center bg-gray-50 p-6"><div className="admin-card w-full max-w-xl p-8 text-center"><h1 className="text-2xl font-black">ایجاد {label} جدید</h1><p className="mt-3 text-gray-500">این مسیر فعال است؛ فرم ثبت واقعی Supabase در مرحله بعد به آن متصل می‌شود.</p><Link href={"/admin/"+section} className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-white">بازگشت</Link></div></main>;
}
