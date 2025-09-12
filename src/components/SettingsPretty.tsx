"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabaseClient";

type Settings = {
    bride?: string | null;
    groom?: string | null;
    date?: string | null;
    start_time?: string | null;
    venue?: string | null;
    address?: string | null;
    map_url?: string | null;
};

export default function SettingsPretty() {
    const { register, handleSubmit, reset, formState: { isSubmitting } } =
        useForm<Settings>();

    useEffect(() => {
        (async () => {
            const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
            if (data) reset(data as Settings);
        })();
    }, [reset]);

    const onSubmit = async (v: Settings) => {
        const { error } = await supabase.from("settings").upsert({ id: 1, ...v });
        if (error) alert(`Lỗi: ${error.message}`); else alert("Đã lưu!");
        // Cho trang ngoài cập nhật lịch/gcal nếu đang mở
        window.dispatchEvent(new CustomEvent("settings:changed"));
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-3">
            <div>
                <label className="block text-xs uppercase mb-1">Cô dâu</label>
                <input className="w-full rounded-xl border px-3 py-2" {...register("bride")} />
            </div>
            <div>
                <label className="block text-xs uppercase mb-1">Chú rể</label>
                <input className="w-full rounded-xl border px-3 py-2" {...register("groom")} />
            </div>

            <div>
                <label className="block text-xs uppercase mb-1">Ngày cưới</label>
                <input type="date" className="w-full rounded-xl border px-3 py-2" {...register("date")} />
            </div>
            <div>
                <label className="block text-xs uppercase mb-1">Giờ bắt đầu</label>
                <input type="time" className="w-full rounded-xl border px-3 py-2" {...register("start_time")} />
            </div>

            <div className="md:col-span-2">
                <label className="block text-xs uppercase mb-1">Địa điểm</label>
                <input className="w-full rounded-xl border px-3 py-2" {...register("venue")} />
            </div>
            <div className="md:col-span-2">
                <label className="block text-xs uppercase mb-1">Địa chỉ</label>
                <input className="w-full rounded-xl border px-3 py-2" {...register("address")} />
            </div>
            <div className="md:col-span-2">
                <label className="block text-xs uppercase mb-1">Link bản đồ</label>
                <input className="w-full rounded-xl border px-3 py-2" {...register("map_url")} />
            </div>

            <div className="md:col-span-2 pt-2">
                <button disabled={isSubmitting} className="rounded-full border px-5 py-2">
                    {isSubmitting ? "Đang lưu…" : "Lưu"}
                </button>
            </div>
        </form>
    );
}
