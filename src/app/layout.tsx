// src/app/layout.tsx
import "./globals.css";
import Providers from "./providers";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://wedding-son-thuy.vercel.app";

export const metadata = {
    metadataBase: new URL(SITE_URL), // rất quan trọng để Next tạo URL tuyệt đối
    title: "Thiệp Cưới",
    description: "Thiệp cưới online của chúng mình 💍",
    openGraph: {
        type: "website",
        url: "/",
        title: "Thiệp Cưới",
        description: "Thiệp cưới online của chúng mình 💍",
        images: [
            {
                url: "/hero-fallback.png", // sẽ thành https://domain/hero-fallback.png
                width: 1200,
                height: 630,
                alt: "Thiệp Cưới",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Thiệp Cưới",
        description: "Thiệp cưới online của Ngọc Sơn & Thanh Thúy 💍",
        images: ["/hero-preview.jpg"],
    },
    icons: {
        icon: "/favicon.ico",
    },
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
