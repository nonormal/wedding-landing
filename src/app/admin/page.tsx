"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SignInForm from "@/components/SignInForm";
import PhotoUploader from "@/components/PhotoUploader";
import PhotosList from "@/components/PhotosList";
import SettingsForm from "@/components/SettingsForm";

export default function AdminPage() {
    const [session, setSession] = useState<null | { user: any }>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session ? { user: data.session.user } : null);
            setLoading(false);
        };
        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
            setSession(s ? { user: s.user } : null);
        });
        return () => listener.subscription.unsubscribe();
    }, []);

    if (loading) return <div className="p-8">Đang tải…</div>;

    if (!session) {
        return (
            <main className="max-w-md mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-4">Đăng nhập admin</h1>
                <SignInForm />
            </main>
        );
    }

    return (
        <main className="max-w-5xl mx-auto p-6 space-y-8">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Bảng điều khiển</h1>
                <button
                    className="rounded-full border px-4 py-2"
                    onClick={async () => await supabase.auth.signOut()}
                >
                    Đăng xuất
                </button>
            </header>

            <section className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-2xl p-4">
                    <h2 className="font-semibold mb-2">Upload ảnh cưới</h2>
                    <PhotoUploader />
                </div>

                <div className="border rounded-2xl p-4">
                    <h2 className="font-semibold mb-2">Thiết lập thiệp</h2>
                    <SettingsForm />
                </div>
            </section>

            <section className="border rounded-2xl p-4">
                <h2 className="font-semibold mb-2">Danh sách ảnh</h2>
                <PhotosList />
            </section>
        </main>
    );
}
