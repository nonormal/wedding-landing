"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const backTo = searchParams.get("redirectedFrom") || "/admin";

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();               // QUAN TRỌNG: không reload trang
        setErr(null);
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);

        if (error) {
            setErr(error.message);
            return;
        }

        // Session đã được set vào cookie bởi @supabase/ssr → middleware sẽ pass
        router.replace(backTo);
    }

    return (
        <div className="min-h-dvh grid place-items-center p-4">
            <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-2xl border p-6 bg-white">
                <h1 className="text-center text-xl font-semibold">Đăng nhập Admin</h1>

                <div className="space-y-1">
                    <label className="text-sm">Email</label>
                    <input
                        type="email"
                        className="w-full rounded border px-3 py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm">Mật khẩu</label>
                    <input
                        type="password"
                        className="w-full rounded border px-3 py-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {err && <p className="text-sm text-red-600">{err}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-60"
                >
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
            </form>
        </div>
    );
}
