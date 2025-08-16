"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Settings = {
    bride: string | null;
    groom: string | null;
    date: string | null;
    start_time: string | null;
    venue: string | null;
    address: string | null;
    map_url: string | null;
};

type Photo = { id: string; url: string; order_index: number };

export default function HomePage() {
    const [s, setS] = useState<Settings | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);

    useEffect(() => {
        (async () => {
            const { data: settings } = await supabase
                .from("settings")
                .select("*")
                .eq("id", 1)
                .single();
            setS(settings ?? null);

            const { data: ph } = await supabase
                .from("photos")
                .select("id,url,order_index")
                .order("order_index", { ascending: true })
                .order("created_at", { ascending: true });
            setPhotos(ph ?? []);
        })();
    }, []);

    return (
        <main className="max-w-6xl mx-auto p-6 space-y-8">
            <section className="text-center space-y-2">
                <h1 className="text-4xl font-serif">
                    {s?.bride ?? "Cô dâu"} &amp; {s?.groom ?? "Chú rể"}
                </h1>
                <p className="text-gray-600">
                    {s?.date ?? "YYYY-MM-DD"} · {s?.start_time ?? "HH:MM"}
                </p>
                {s?.venue && <p className="text-gray-700">{s.venue}</p>}
                {s?.address && <p className="text-gray-700">{s.address}</p>}
                {s?.map_url && (
                    <a className="inline-block border rounded-full px-4 py-2 mt-2"
                       href={s.map_url} target="_blank" rel="noreferrer">Xem bản đồ</a>
                )}
            </section>

            <section className="columns-1 sm:columns-2 md:columns-3 gap-3 [column-fill:_balance]">
                {photos.map((p) => (
                    <img key={p.id} src={p.url} className="mb-3 w-full rounded-xl"
                         alt="" loading="lazy" />
                ))}
            </section>
        </main>
    );
}
