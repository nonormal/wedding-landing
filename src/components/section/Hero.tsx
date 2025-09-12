"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Settings = {
    bride?: string | null;
    groom?: string | null;
    date?: string | null;        // "YYYY-MM-DD"
    start_time?: string | null;  // "HH:MM" hoặc "HH:MM:SS"
    venue?: string | null;
    address?: string | null;
};

function formatDateDot(d?: string | null) {
    if (!d) return "";
    const x = new Date(d + "T00:00:00");
    const dd = String(x.getDate()).padStart(2, "0");
    const mm = String(x.getMonth() + 1).padStart(2, "0");
    const yyyy = x.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
}

export default function Hero() {
    const [heroDesktop, setHeroDesktop] = useState<string | null>(null);
    const [heroMobile, setHeroMobile]   = useState<string | null>(null);
    const [isMobile, setIsMobile]       = useState(false);
    const [s, setS] = useState<Settings | null>(null);

    // chọn URL theo màn hình
    const bgUrl = (isMobile ? (heroMobile || heroDesktop) : (heroDesktop || heroMobile)) ?? "/hero-fallback.png";

    useEffect(() => {
        const loadPhotos = async () => {
            const [{ data: d1 }, { data: d2 }] = await Promise.all([
                supabase.from("photos")
                    .select("url").eq("group_name", "cover")
                    .order("order_index", { ascending: true, nullsFirst: true })
                    .order("created_at", { ascending: true }).limit(1),
                supabase.from("photos")
                    .select("url").eq("group_name", "cover_mobile")
                    .order("order_index", { ascending: true, nullsFirst: true })
                    .order("created_at", { ascending: true }).limit(1),
            ]);
            setHeroDesktop(d1?.[0]?.url ?? null);
            setHeroMobile(d2?.[0]?.url ?? null);
        };

        const loadSettings = async () => {
            const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
            if (data) setS(data as Settings);
        };

        // media query để biết đang là mobile
        const mq = window.matchMedia("(max-width: 768px)");
        const apply = () => setIsMobile(mq.matches);
        apply();
        mq.addEventListener?.("change", apply);

        loadPhotos();
        loadSettings();

        // reload khi admin đổi ảnh/thiết lập
        const onPhotosChanged   = () => loadPhotos();
        const onSettingsChanged = () => loadSettings();
        window.addEventListener("photos:changed", onPhotosChanged);
        window.addEventListener("settings:changed", onSettingsChanged);

        return () => {
            mq.removeEventListener?.("change", apply);
            window.removeEventListener("photos:changed", onPhotosChanged);
            window.removeEventListener("settings:changed", onSettingsChanged);
        };
    }, []);

    const names =
        s?.groom || s?.bride ? `${s?.groom ?? s?.bride ?? ""} & ${s?.bride ?? s?.groom ?? ""}`.trim()
            : "Cô dâu & Chú rể";

    const metaLine =
        s?.date || s?.start_time || s?.venue
            ? `${formatDateDot(s?.date)} • ${s?.start_time ?? ""} — ${s?.venue ?? ""}${s?.address ? `, ${s.address}` : ""}`
            : "Ngày • Giờ — Địa điểm";

    return (
        <section className="relative h-[85vh] min-h-[520px] w-full" id="top">
            {/* Ảnh nền */}
            <div
                className="absolute inset-0 bg-center bg-cover"
                style={{ backgroundImage: `url(${bgUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

            {/* Container */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
                {/* Phần chữ */}
                <div
                    className="
          text-center space-y-2
          absolute top-16 w-full   /* mobile: đẩy lên đầu dưới navbar */
          md:static md:space-y-3  /* desktop: quay lại giữa như cũ */
        "
                >
                    <p className="tracking-[0.3em] uppercase text-xs/relaxed">Wedding Invitation</p>
                    <h1 className="font-serif text-4xl md:text-7xl">{names}</h1>
                    <p className="text-sm md:text-lg opacity-95">{metaLine}</p>
                </div>

                {/* Nút */}
                <div
                    className="
    absolute left-1/2 -translate-x-1/2 top-[65%]  /* mobile: ~1/3 từ dưới lên */
    flex justify-center gap-3
    md:static md:translate-x-0 md:top-auto md:pt-3
  "
                >
                    <a
                        href="#gallery"
                        className="rounded-full bg-white text-black px-5 py-2 whitespace-nowrap"
                    >
                        Xem bộ ảnh
                    </a>
                    <a
                        href="#rsvp"
                        className="rounded-full border border-white px-5 py-2 whitespace-nowrap"
                    >
                        RSVP
                    </a>
                </div>

            </div>
        </section>
    );

}
