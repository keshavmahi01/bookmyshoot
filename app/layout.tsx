import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ShortlistBar from "@/components/shortlist-bar";
import RegisterServiceWorker from "@/components/register-sw";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL("https://bookmyshoot.in"),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Search verified photographers, videographers and drone operators by city, date and shoot type. See real rates, a live calendar and reviews from finished jobs.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "BookMyShoot", statusBarStyle: "black-translucent" },
};

export const viewport = {
  themeColor: "#0f0e13",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets the theme before the first paint, so the page never flashes white. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bms-theme');if(t==='light'){document.documentElement.dataset.theme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <ShortlistBar />
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
