import "./globals.css";
import Providers from "./providers";
import type { Metadata } from "next";


const SITE_URL =
    (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "")) || "http://localhost:3000";
const OG_IMAGE = `${SITE_URL}/hero_preview.jpg`;

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Thiệp Cưới",
        template: "%s · Thiệp Cưới",
    },
    description: "Thiệp cưới online của chúng mình 💍",
    openGraph: {
        title: "Thiệp Cưới",
        description: "Mời bạn xem thiệp cưới online của chúng mình 💍",
        url: SITE_URL,
        siteName: "Thiệp Cưới",
        images: [
            {
                url: OG_IMAGE,
                width: 1200,
                height: 630,
                alt: "Thiệp cưới của chúng mình",
            },
        ],
        type: "website",
        locale: "vi_VN",
    },
    twitter: {
        card: "summary_large_image",
        title: "Thiệp Cưới",
        description: "Mời bạn xem thiệp cưới online của chúng mình 💍",
        images: [OG_IMAGE],
    },

    icons: { icon: "/favicon.ico" },
    themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi" suppressHydrationWarning>
        <body className="min-h-dvh bg-[--bg] text-[--ink] transition-colors">
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
