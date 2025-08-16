"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabaseClient";

type Settings = {
    bride: string | null;
    groom: string | null;
    date: string | null;       // yyyy-mm-dd
    start_time: string | null; // HH:MM
    venue: string | null;
    address: string | null;
    map_url: string | null;
};

export default function SettingsForm() {
    const { register, handleSubmit, reset } = useForm<Settings>();
    const [msg, setMsg] = useState<string | null>(null);

    const load = async () => {
        const { data } = await supabase
            .from("settings")
            .select("*")
            .eq("id", 1)
            .single();
        if (data) {
            reset({
                bride: data.bride ?? "",
                groom: data.groom ?? "",
                date: data.date ?? "",
                start_time: data.start_time ?? "",
                venue: data.venue ?? "",
                address: data.address ?? "",
                map_url: data.map_url ?? "",
            });
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

    const onSubmit = async (v: Settings) => {
        setMsg(null);
        const { error } = await supabase.from("settings").upsert({
            id: 1,
            ...v,
        });
        setMsg(error ? error.message : "Đã lưu!");
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm mb-1">Cô dâu</label>
                    <input className="w-full border rounded-lg px-3 py-2" {...register("bride")} />
                </div>
                <div>
                    <label className="block text-sm mb-1">Chú rể</label>
                    <input className="w-full border rounded-lg px-3 py-2" {...register("groom")} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm mb-1">Ngày cưới (YYYY-MM-DD)</label>
                    <input className="w-full border rounded-lg px-3 py-2" type="date" {...register("date")} />
                </div>
                <div>
                    <label className="block text-sm mb-1">Giờ bắt đầu</label>
                    <input className="w-full border rounded-lg px-3 py-2" type="time" {...register("start_time")} />
                </div>
            </div>

            <div>
                <label className="block text-sm mb-1">Địa điểm</label>
                <input className="w-full border rounded-lg px-3 py-2" {...register("venue")} />
            </div>
            <div>
                <label className="block text-sm mb-1">Địa chỉ</label>
                <input className="w-full border rounded-lg px-3 py-2" {...register("address")} />
            </div>
            <div>
                <label className="block text-sm mb-1">Link bản đồ</label>
                <input className="w-full border rounded-lg px-3 py-2" {...register("map_url")} />
            </div>

            <button className="rounded-full border px-4 py-2">Lưu</button>
            {msg && <p className="text-sm">{msg}</p>}
        </form>
    );
}
