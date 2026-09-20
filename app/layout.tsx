import "./globals.css";
import type { Metadata } from "next";
export const metadata:Metadata={title:"پنل مدیریت | فروشگاه و آکادمی امیرعلی",description:"مدیریت فروشگاه و آکادمی امیرعلی",icons:{icon:"https://zhexlpaugdnhnbylpoda.supabase.co/storage/v1/object/public/site-assets/branding/logo-1789562479843.png"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body>{children}</body></html>}
