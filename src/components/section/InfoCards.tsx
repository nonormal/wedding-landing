"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// ---- Types
type Settings = {
    bride: string | null;
    groom: string | null;
    date: string | null;        // "YYYY-MM-DD"
    start_time: string | null;  // "HH:MM" hoặc "HH:MM:SS"
    venue: string | null;
    address: string | null;
    map_url: string | null;
};

// ---- Helpers
const pad = (n: number) => n.toString().padStart(2, "0");

// tạo Date (local) từ chuỗi ngày/giờ an toàn
function makeLocalDate(d?: string | null, t?: string | null): Date | null {
    if (!d || !t) return null;
    // t có thể "HH:MM" hoặc "HH:MM:SS"
    const [hh, mm] = t.split(":");
    const h = Number(hh);
    const m = Number(mm);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;

    const dt = new Date(d); // local 00:00
    if (Number.isNaN(dt.getTime())) return null;
    dt.setHours(h, m, 0, 0);
    return dt;
}

// format UTC cho Google Calendar / ICS: YYYYMMDDTHHMMSSZ
function toUTCStamp(x: Date): string {
    return (
        x.getUTCFullYear().toString() +
        pad(x.getUTCMonth() + 1) +
        pad(x.getUTCDate()) +
        "T" +
        pad(x.getUTCHours()) +
        pad(x.getUTCMinutes()) +
        pad(x.getUTCSeconds()) +
        "Z"
    );
}

// tạo URL tải file ICS từ thông tin sự kiện
function makeICSHref(start: Date, end: Date, title: string, location: string): string {
    const body = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Wedding Invite//VI//",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        "DTSTART:" + toUTCStamp(start),
        "DTEND:" + toUTCStamp(end),
        "SUMMARY:" + title,
        "LOCATION:" + location,
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");
    return URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
}

export default function InfoCards() {
    const [s, setS] = useState<Settings | null>(null);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
            if (!error) setS(data as Settings);
        })();
    }, []);

    const start = useMemo(() => makeLocalDate(s?.date ?? null, s?.start_time ?? null), [s]);
    const end = useMemo(() => (start ? new Date(start.getTime() + 2 * 60 * 60 * 1000) : null), [start]);

    const title = s ? `Lễ cưới của ${s.bride ?? ""} & ${s.groom ?? ""}` : "Wedding";
    const location = s ? `${s.venue ?? ""}${s.venue && s.address ? ", " : ""}${s.address ?? ""}` : "";

    const gcal = useMemo(() => {
        if (!start || !end) return "#";
        const url = new URL("https://www.google.com/calendar/render");
        url.searchParams.set("action", "TEMPLATE");
        url.searchParams.set("text", title);
        url.searchParams.set("dates", `${toUTCStamp(start)}/${toUTCStamp(end)}`);
        url.searchParams.set("location", location);
        return url.toString();
    }, [start, end, title, location]);

    const icsHref = useMemo(() => {
        if (!start || !end) return "#";
        return makeICSHref(start, end, title, location);
    }, [start, end, title, location]);

    return (
        <section id="info" className="py-12">
            <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-3 gap-6">
                {/* Thời gian */}
                <div className="border rounded-2xl p-6 bg-white/80 backdrop-blur shadow-sm">
                    <h3 className="text-sm uppercase tracking-wide text-gray-700 mb-2">Thời gian</h3>
                    <p className="font-medium">
                        {(s?.date ?? "YYYY-MM-DD")} • {(s?.start_time ?? "HH:MM")}
                    </p>
                </div>

                {/* Địa điểm */}
                <div className="border rounded-2xl p-6 bg-white/80 backdrop-blur shadow-sm">
                    <h3 className="text-sm uppercase tracking-wide text-gray-700 mb-2">Địa điểm</h3>
                    <p className="font-medium">{s?.venue ?? "Venue"}</p>
                    <p className="text-gray-700">{s?.address ?? "Address"}</p>
                    {s?.map_url && (
                        <a className="inline-block mt-2 underline" href={s.map_url} target="_blank" rel="noreferrer">
                            Xem bản đồ
                        </a>
                    )}
                </div>

                {/* Lịch */}
                <div className="border rounded-2xl p-6 bg-white/80 backdrop-blur shadow-sm">
                    <h3 className="text-sm uppercase tracking-wide text-gray-700 mb-2">Lịch</h3>
                    <div className="flex flex-wrap gap-2">
                        <a className="rounded-full border px-4 py-2" href={gcal} target="_blank" rel="noreferrer">
                            Google Calendar
                        </a>
                        {start && end && (
                            <a className="rounded-full border px-4 py-2" href={icsHref} download="wedding.ics">
                                Tải ICS
                            </a>
                        )}
                    </div>
                    {!start && (
                        <p className="text-xs text-gray-500 mt-2">
                            Hãy điền ngày/giờ trong phần <em>Settings</em> để bật các nút lịch.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
