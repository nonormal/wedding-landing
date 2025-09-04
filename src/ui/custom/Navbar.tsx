"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
                scrolled
                    ? "bg-white/90 backdrop-blur border-b text-black"
                    : "bg-transparent text-white"
            }`}
        >
            <nav className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
                <Link href="/" className="font-serif text-xl">
                    Thiệp Cưới
                </Link>
                <div className="hidden sm:flex gap-6 text-sm font-medium">
                    <a href="#about" className="hover:opacity-80">
                        Giới thiệu
                    </a>
                    <a href="#info" className="hover:opacity-80">
                        Thông tin
                    </a>
                    <a href="#gallery" className="hover:opacity-80">
                        Bộ ảnh
                    </a>
                    <a href="#rsvp" className="hover:opacity-80">
                        RSVP
                    </a>
                </div>
            </nav>
        </header>
    );
}
