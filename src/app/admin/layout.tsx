"use client";
import { useState } from "react";
import Topbar from "@/components/admin/Topbar";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-dvh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
            <Topbar onOpen={() => setOpen(true)} />
            <div className="pt-14" /> {/* tránh Topbar che nội dung nếu Topbar fixed */}
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[18rem_1fr] md:px-6">
                <Sidebar open={open} onClose={() => setOpen(false)} />
                <main className="space-y-6">{children}</main>
            </div>
        </div>
    );
}
