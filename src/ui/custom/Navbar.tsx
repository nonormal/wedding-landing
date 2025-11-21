"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const GROUPS = [
    { key: "ancestor_ceremony",       label: "Ảnh Lễ Gia Tiên" },
    { key: "wedding-party",       label: "Ảnh Tiệc Cưới" },
    { key: "free",          label: "Nhà Hát Thành Phố" },
    { key: "concept1",      label: "Concept 1" },
    { key: "concept2",      label: "Concept 2" },
    { key: "traditional",   label: "Ảnh cổ phục" },
    { key: "wedding",       label: "Bộ ảnh cưới" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        // Click ngoài để đóng dropdown
        const close = () => setOpen(false);
        window.addEventListener("click", close);

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("click", close);
        };
    }, []);

    const scrollToSection = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (!el) return;

        const header = document.getElementById("navbar-root");
        const offset = (header?.offsetHeight ?? 56) + 8;
        const y = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: "smooth" });
    }, []);

    return (
        <header
            id="navbar-root"
            className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
                scrolled
                    ? "bg-white/90 backdrop-blur border-b text-black"
                    : "bg-transparent text-white"
            }`}
        >
            <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
                <Link href="/" className="font-serif text-xl">
                    Thiệp Cưới
                </Link>

                {/* desktop */}
                <div className="hidden items-center gap-6 text-sm font-medium sm:flex">
                    <a href="#about" className="hover:opacity-80">
                        Giới thiệu
                    </a>
                    <a href="#info" className="hover:opacity-80">
                        Thông tin
                    </a>

                    <div
                        className="relative"
                        onMouseEnter={() => setOpen(true)}
                        onMouseLeave={() => setOpen(false)}
                    >
                        <button
                            type="button"
                            className="hover:opacity-80"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen((v) => !v);
                            }}
                        >
                            Bộ ảnh
                        </button>

                        {/* menu */}
                        <div
                            className={`absolute right-0 mt-2 w-56 rounded-xl border bg-white text-black shadow-lg transition
                ${open ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-1"}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ul className="py-2 text-sm">
                                {GROUPS.map((g) => (
                                    <li key={g.key}>
                                        <button
                                            className="block w-full px-4 py-2 text-left hover:bg-neutral-50"
                                            onClick={() => {
                                                setOpen(false);
                                                scrollToSection(`gallery-${g.key}`);
                                            }}
                                        >
                                            {g.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <a href="#rsvp" className="hover:opacity-80">
                        RSVP
                    </a>
                </div>
            </nav>
        </header>
    );
}
