"use client";
import { X, Upload, Settings, Images } from "lucide-react";
import { useEffect } from "react";

export default function Sidebar({
                                    open, onClose,
                                }: { open: boolean; onClose: () => void }) {

    // đóng khi bấm ESC
    useEffect(() => {
        const f = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", f);
        return () => window.removeEventListener("keydown", f);
    }, [onClose]);

    return (
        <>
            {/* overlay mobile */}
            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/20 dark:bg-black/50 md:hidden transition ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />
            <aside
                className={`fixed z-50 top-0 left-0 h-dvh w-72 border-r bg-white dark:bg-neutral-900 md:static md:block transition-transform
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                <div className="flex h-14 items-center justify-between px-4 border-b md:hidden">
                    <div className="font-semibold">Điều hướng</div>
                    <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full border">
                        <X size={16}/>
                    </button>
                </div>
                <nav className="p-3 space-y-1">
                    <a href="#upload" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
                        <Upload size={16}/> Upload ảnh
                    </a>
                    <a href="#settings" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
                        <Settings size={16}/> Thiết lập thiệp
                    </a>
                    <a href="#photos" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
                        <Images size={16}/> Quản lý ảnh
                    </a>
                </nav>
            </aside>
        </>
    );
}
