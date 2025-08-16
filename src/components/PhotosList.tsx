"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Photo = { id: string; url: string; caption: string | null; order_index: number; };

export default function PhotosList() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("photos")
            .select("*")
            .order("order_index", { ascending: true })
            .order("created_at", { ascending: true });
        setPhotos(data || []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const remove = async (id: string) => {
        if (!confirm("Xoá ảnh này?")) return;
        const { error } = await supabase.from("photos").delete().eq("id", id);
        if (!error) load();
    };

    return (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {loading && <p className="p-2">Đang tải…</p>}
            {!loading && photos.length === 0 && <p className="p-2">Chưa có ảnh.</p>}
            {photos.map((p) => (
                <div key={p.id} className="border rounded-xl overflow-hidden">
                    <img src={p.url} className="w-full h-40 object-cover" alt="" />
                    <div className="p-2 flex justify-between items-center">
                        <span className="text-sm text-gray-600">#{p.order_index}</span>
                        <button className="text-red-600 text-sm" onClick={() => remove(p.id)}>Xoá</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
