"use client";
import { Menu } from "lucide-react";
import Link from "next/link";

export default function Topbar({ onOpen }: { onOpen: () => void }) {
    return (
        <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur dark:bg-black/40">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpen}
                        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-black/5 dark:hover:bg-white/10"
                        aria-label="Open menu"
                    >
                        <Menu size={18}/>
                    </button>
                    <Link href="/" className="font-serif text-lg">Thiệp cưới · Admin</Link>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Link
                        href="/"
                        className="rounded-full border px-3 py-1.5 text-sm hover:-translate-y-0.5 hover:shadow transition"
                    >
                        Xem trang
                    </Link>
                </div>
            </div>
        </header>
    );
}

import ThemeToggle from "@/ui/custom/ThemeToggle";
