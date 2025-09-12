import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
    // Cho qua các route không phải admin
    if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();

    const res = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => req.cookies.get(name)?.value,
                set: (name, value, options) => {
                    res.cookies.set({ name, value, ...options });
                },
                remove: (name, options) => {
                    res.cookies.set({ name, value: "", ...options, maxAge: 0 });
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirectedFrom", req.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    return res;
}

export const config = { matcher: ["/admin/:path*"] };
