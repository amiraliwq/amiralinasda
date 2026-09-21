import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

const sections: Record<string, { title: string; table: string; columns: string[] }> = {
  orders: { title: "سفارش‌ها", table: "orders", columns: ["id", "total", "status", "created_at"] },
  payments: { title: "پرداخت‌ها", table: "payments", columns: ["id", "status", "created_at"] },
  products: { title: "محصولات", table: "products", columns: ["id", "title", "slug", "price", "active"] },
  categories: { title: "دسته‌بندی‌ها", table: "product_categories", columns: ["id", "name", "slug"] },
  users: { title: "کاربران", table: "profiles", columns: ["id", "username", "phone", "role", "created_at"] },
  courses: { title: "دوره‌ها", table: "courses", columns: ["id", "title", "published", "created_at"] },
  assignments: { title: "تکالیف", table: "assignment_submissions", columns: ["id", "status", "created_at"] },
  classes: { title: "کلاس‌های آنلاین", table: "live_sessions", columns: ["id", "title", "starts_at", "status"] },
  blog: { title: "وبلاگ", table: "blog_posts", columns: ["id", "title", "published", "created_at"] },
  media: { title: "رسانه‌ها", table: "product_images", columns: ["id", "product_id", "url", "created_at"] },
  settings: { title: "تنظیمات", table: "site_settings", columns: ["key", "value"] },
};

function fa(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  if (typeof value === "number") return value.toLocaleString("fa-IR");
  if (typeof value === "string" && value.length > 28) return value.slice(0, 28) + "…";
  return String(value);
}

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const config = sections[section];
  if (!config) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.from(config.table).select("*").limit(50);

  return (
    <main className="admin-shell min-h-screen p-4 lg:p-6" dir="rtl">
      <div className="mx-auto max-w-[1500px]">
        <div className="admin-card mb-5 flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <Link href="/admin" className="text-sm text-purple-700">← بازگشت به داشبورد</Link>
            <h1 className="mt-2 text-2xl font-black">{config.title}</h1>
            <p className="mt-1 text-sm text-gray-500">اطلاعات مستقیم از Supabase — بدون داده نمایشی</p>
          </div>
          <Link href="/admin" className="rounded-xl bg-black px-4 py-2 text-sm text-white">داشبورد</Link>
        </div>
        {error ? (
          <div className="admin-card border-red-200 bg-red-50 p-6 text-red-700">
            <b>خطا در دریافت اطلاعات</b><p className="mt-2 text-sm">{error.message}</p>
          </div>
        ) : (
          <div className="admin-card overflow-hidden">
            <div className="border-b bg-gray-50 p-4 text-sm text-gray-500">{data?.length?.toLocaleString("fa-IR") ?? "۰"} رکورد نمایش داده می‌شود.</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-right text-sm">
                <thead className="bg-gray-50 text-gray-500"><tr>{config.columns.map((c) => <th key={c} className="p-4 font-semibold">{c}</th>)}</tr></thead>
                <tbody>{(data ?? []).map((row: Record<string, unknown>, index: number) => <tr key={String(row.id ?? row.key ?? index)} className="border-t hover:bg-gray-50">{config.columns.map((c) => <td key={c} className="max-w-[280px] p-4">{fa(row[c])}</td>)}</tr>)}</tbody>
              </table>
              {!data?.length && <div className="p-10 text-center text-gray-500">هنوز رکوردی ثبت نشده است.</div>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
