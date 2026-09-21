# برنامه انتشار عمومی — فروشگاه و آکادمی امیرعلی

این شاخه برای سخت‌گیری نهایی قبل از انتشار عمومی استفاده می‌شود.

## قبل از Production
- [ ] Build موفق Next.js
- [ ] تست Login/Register و session
- [ ] تست OTP مدیر با Kavenegar و secrets واقعی خارج از repository
- [ ] تست مسیر خرید، سفارش و رسید پرداخت
- [ ] تکمیل CRUD پنل مدیریت
- [ ] تکمیل مدیریت کاربران، دوره‌ها، کلاس‌ها و تکالیف
- [ ] بررسی RLS و محدودیت اجرای RPCها
- [ ] اجرای تست‌های E2E
- [ ] تنظیم Environment Variables در Vercel
- [ ] Production Deployment موفق
- [ ] اتصال دامنه نهایی

## نکات امنیتی
کلیدهای Secret و رمزهای واقعی نباید در GitHub ذخیره شوند. کلید publishable برای client و کلید secret فقط برای backend استفاده شوند.

## وضعیت فعلی
در 2026-09-21، Supabase فعال است و Edge Functionهای `kavenegar-sms` و `firecrawl-search` فعال هستند. آخرین status گیت‌هاب برای Vercel شکست build/deployment را نشان می‌دهد و انتشار عمومی هنوز تأیید نشده است.
