"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PhotoUploader() {
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBusy(true); setMsg(null);
        try {
            const ext = file.name.split(".").pop();
            const path = `wedding/${Date.now()}.${ext}`;

            // 1) upload lên storage
            const { error: upErr } = await supabase
                .storage
                .from("photos")
                .upload(path, file, { cacheControl: "3600", upsert: false });
            if (upErr) throw upErr;

            // 2) lấy public URL
            const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
            const publicUrl = pub.publicUrl;

            // 3) ghi vào bảng photos
            const { error: dbErr } = await supabase
                .from("photos")
                .insert({ url: publicUrl, caption: null, order_index: 0 });
            if (dbErr) throw dbErr;

            setMsg("Đã upload thành công!");
            e.target.value = ""; // reset input
        } catch (err: any) {
            setMsg(err.message ?? "Lỗi upload");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-2">
            <input type="file" accept="image/*" onChange={onFileChange}
                   disabled={busy}
                   className="block w-full text-sm" />
            {busy && <p className="text-sm text-gray-600">Đang upload…</p>}
            {msg && <p className="text-sm">{msg}</p>}
        </div>
    );
}
