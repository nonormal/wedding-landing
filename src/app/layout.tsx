import "./globals.css";
import Providers from "./providers";

export const metadata = { title: "Wedding", description: "Wedding landing" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi" suppressHydrationWarning>
        <body className="min-h-dvh bg-[--bg] text-[--ink] transition-colors">
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
