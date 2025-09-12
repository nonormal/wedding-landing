"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Photo = { id: string; url: string };

export default function GalleryMasonry() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    useEffect(() => {
        (async () => {
            const { data } = await supabase
                .from("photos")
                .select("id,url,group_name,order_index,created_at")
                .eq("group_name", "wedding") // chỉ lấy nhóm “Bộ ảnh cưới”
                .order("order_index", { ascending: true, nullsFirst: true })
                .order("created_at", { ascending: true });

            setPhotos(data ?? []);
        })();
    }, []);

    return (
        <section id='gallery-wedding' className="scroll-mt-24">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                <h2 className="font-serif text-3xl md:text-4xl text-center mb-6">Bộ ảnh cưới</h2>
                <div className="columns-1 sm:columns-2 md:columns-3 gap-3 [column-fill:_balance]">
                    {photos.map(p => (
                        <img key={p.id} src={p.url} alt="" loading="lazy"
                             className="mb-3 w-full rounded-2xl shadow-sm hover:opacity-95" />
                    ))}
                </div>
            </div>
        </section>
    );
}
