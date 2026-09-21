"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type CartItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
  image_url?: string | null;
  type?: string | null;
};

function loadCart(): CartItem[] {
  try {
    const value = JSON.parse(localStorage.getItem("amirali-cart") || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState({firstName:"",lastName:"",phone:"",postalCode:"",province:"",city:"",fullAddress:"",floor:"",unit:"",ringBell:""});

  useEffect(() => setItems(loadCart()), []);

  const hasPhysical = useMemo(() => items.some((item) => !["digital","font","course"].includes(item.type || "")), [items]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Math.max(1, Number(item.qty || 1)), 0),
    [items],
  );

  function persist(next: CartItem[]) {
    setItems(next);
    localStorage.setItem("amirali-cart", JSON.stringify(next));
  }

  async function checkout() {
    setMessage("");
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login?next=/cart";
        return;
      }

      if (!items.length) {
        setMessage("سبد خرید خالی است.");
        return;
      }

      if (hasPhysical && (!address.firstName || !address.lastName || !address.phone || !address.postalCode || !address.province || !address.city || !address.fullAddress)) { setMessage("برای محصول فیزیکی، اطلاعات ارسال را کامل کنید."); return; }

      const { data, error } = await supabase.rpc("create_order_from_cart", {
        p_items: items.map((item) => ({ id: item.id, qty: Math.max(1, Number(item.qty || 1)) })),
        p_first_name: address.firstName || null,
        p_last_name: address.lastName || null,
        p_phone: address.phone || null,
        p_postal_code: address.postalCode || null,
        p_province: address.province || null,
        p_city: address.city || null,
        p_full_address: address.fullAddress || null,
        p_floor: address.floor || null,
        p_unit: address.unit || null,
        p_ring_bell: address.ringBell || null,
      });

      if (error) {
        setMessage(
          error.message.includes("SHIPPING_ADDRESS_REQUIRED")
            ? "این سبد شامل محصول فیزیکی است؛ اطلاعات ارسال باید تکمیل شود."
            : "ثبت سفارش انجام نشد. دوباره تلاش کنید.",
        );
        return;
      }

      localStorage.removeItem("amirali-cart");
      setItems([]);
      window.location.href = data?.order_id ? `/orders/${data.order_id}` : "/orders";
    } finally {
      setBusy(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f7f4] p-5">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4 py-5">
          <Link href="/" className="font-black">فروشگاه و آکادمی امیرعلی</Link>
          <Link href="/products" className="rounded-xl border bg-white px-4 py-2 text-sm">ادامه خرید</Link>
        </header>

        <section className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black">سبد خرید</h1>

          {items.length ? (
            <div className="mt-7 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border p-4">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="h-20 w-20 rounded-xl object-cover" />
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-gray-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold">{item.title}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {Number(item.price || 0).toLocaleString("fa-IR")} تومان × {item.qty}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => persist(items.filter((row) => row.id !== item.id))}
                    className="rounded-xl border px-3 py-2 text-sm text-red-600"
                  >
                    حذف
                  </button>
                </div>
              ))}

              {hasPhysical && <div className="border-t pt-5"><h2 className="font-black">اطلاعات ارسال</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{([["firstName","نام"],["lastName","نام خانوادگی"],["phone","شماره تماس"],["postalCode","کد پستی"],["province","استان"],["city","شهر"],["floor","طبقه"],["unit","واحد"],["ringBell","زنگ"] ] as const).map(([key,label])=><input key={key} value={address[key]} onChange={e=>setAddress({...address,[key]:e.target.value})} placeholder={label} className="rounded-xl border p-3" />)}<textarea value={address.fullAddress} onChange={e=>setAddress({...address,fullAddress:e.target.value})} placeholder="آدرس کامل" className="sm:col-span-2 rounded-xl border p-3" rows={3}/></div></div>}

              <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                <div>
                  <div className="text-sm text-gray-500">جمع کل</div>
                  <div className="text-2xl font-black">{total.toLocaleString("fa-IR")} تومان</div>
                </div>
                <button
                  type="button"
                  onClick={checkout}
                  disabled={busy}
                  className="rounded-2xl bg-black px-6 py-3 font-bold text-white disabled:opacity-50"
                >
                  {busy ? "در حال ثبت سفارش…" : "ثبت سفارش"}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed p-10 text-center text-gray-500">
              سبد خرید شما خالی است.
            </div>
          )}

          {message && <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{message}</div>}
        </section>
      </div>
    </main>
  );
}
