"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import GallerySection from "@/components/gallery/GallerySection";

type Photo = {
    id: string;
    url: string;
    group_name: string;
    order_index: number | null;
    created_at: string | null;
};

const GROUPS: { key: Photo["group_name"]; label: string }[] = [
    { key: "free",          label: "Nhà Hát Thành Phố"},
    { key: "concept1",      label: "Concept 1" },
    { key: "concept2",      label: "Concept 2" },
    { key: "traditional",   label: "Ảnh cổ phục" },
    { key: "album",         label: "Album" },
];

export default function Gallery() {
    const [photosByGroup, setPhotosByGroup] = useState<Record<string, Photo[]>>({});

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase
                .from("photos")
                .select("id,url,group_name,order_index,created_at")
                .order("order_index", { ascending: true, nullsFirst: true })
                .order("created_at", { ascending: true });

            const grouped: Record<string, Photo[]> = {};
            for (const g of GROUPS) grouped[g.key] = [];
            for (const p of (data as Photo[]) || []) {
                (grouped[p.group_name] ??= []).push(p);
            }
            setPhotosByGroup(grouped);
        };

        load();
        window.addEventListener("photos:changed", load);
        return () => window.removeEventListener("photos:changed", load);
    }, []);

    return (
        <section id="gallery" className="py-16">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                <div className="space-y-12">
                    {GROUPS.map((g) => {
                        const list = photosByGroup[g.key] || [];
                        if (list.length === 0) return null;

                        return (
                            <section key={g.key} id={`gallery-${g.key}`} className="scroll-mt-24">
                                <GallerySection title={g.label} photos={list} />
                            </section>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
