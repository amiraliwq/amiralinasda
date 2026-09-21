# وضعیت پروژه فروشگاه و آکادمی امیرعلی

نام هدف: amirali-razi-iran

## ممیزی
- مخزن فعلی `amiralinasda` در شاخه main فقط فایل `qibla-compass.html` داشت و کد فروشگاه/آکادمی در آن پیدا نشد.
- شاخه توسعه: `feature/amirali-razi-iran`
- برای حفظ قابلیت‌های قبلی، هیچ فایل اجرایی قبلی حذف یا بازنویسی نشده است.

## Supabase
پروژه مبنا: `amiralima` / `zhexlpaugdnhnbylpoda`
- PostgreSQL 17
- جدول‌های موجود شامل محصولات، تصاویر، دسته‌بندی، کاربران، سفارش، آیتم سفارش، پرداخت، دوره، ثبت‌نام دوره، درس، پیشرفت، تکالیف، ارسال تکلیف، کلاس آنلاین، لاگ کلاس، منابع کلاس، وبلاگ و تنظیمات سایت هستند.
- جدول‌های گزارش‌شده RLS فعال دارند.
- migrationهای قبلی شامل hardening سفارش، ادمین، live sessions و core constraints هستند.
- تابع‌های موجود شامل create_order_from_cart، admin_set_payment_status، has_course_access، enter_live_session و ... هستند.

## Findings
- Security advisor چند تابع SECURITY DEFINER را قابل فراخوانی از API گزارش کرده است؛ این مورد باید با revoke/grant حداقلی اصلاح شود.
- Performance advisor چند policy تکراری/موازی و چند index تکراری گزارش کرده است.
- اتصال فرانت‌اند باید با Supabase SSR و publishable key انجام شود؛ service-role key نباید در کلاینت قرار گیرد.

## Secret handling
هیچ رمز مدیر یا service-role key در repository قرار نگرفته است.


2026-09-21 — Vercel deployment retry trigger.
