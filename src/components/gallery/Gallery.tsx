"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import GallerySection from "@/components/gallery/GallerySection";

const GROUPS = [
    { key: "cover", label: "Ảnh bìa" },
    { key: "cover_mobile", label: "Ảnh bìa mobile" },
    { key: "free", label: "Ảnh tự do" },
    { key: "concept1", label: "Concept 1" },
    { key: "concept2", label: "Concept 2" },
    { key: "traditional", label: "Ảnh cổ phục" },
    { key: "album", label: "Album" },
];

export default function Gallery() {
    const [photos, setPhotos] = useState<Record<string, any[]>>({});

    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from("photos")
                .select("id,url,group_name,order_index,created_at")
                .order("order_index", { ascending: true, nullsFirst: true })
                .order("created_at");

            const grouped: Record<string, any[]> = {};
            for (const g of GROUPS) grouped[g.key] = [];
            for (const p of data || []) {
                (grouped[p.group_name] ??= []).push(p);
            }
            setPhotos(grouped);
        }
        load();
        window.addEventListener("photos:changed", load);
        return () => window.removeEventListener("photos:changed", load);
    }, []);

    return (
        <section id="gallery" className="py-16">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                <div className="space-y-12">
                    {GROUPS.map((g) => (
                        <GallerySection
                            key={g.key}
                            title={g.label}
                            photos={photos[g.key] || []}
                        />
                    ))}
                </div>
            </div>
        </section>

    );
}
