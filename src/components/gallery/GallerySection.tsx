// src/components/gallery/GallerySection.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type Photo = { id: string; url: string };
type Props = {
    title?: string;
    photos: Photo[];
    /**
     * Tỉ lệ khung cố định cho preview để không bị "giật".
     * Ví dụ "16/9", "4/3", "1/1"… (Tailwind arbitrary values)
     */
    aspect?: `${number}/${number}`;
    /**
     * Chiều cao tối đa (đảm bảo không chiếm quá nhiều màn hình)
     */
    maxHeightClass?: string; // ví dụ "max-h-[78vh]"
};

export default function GallerySection({
                                           title,
                                           photos,
                                           aspect = "16/9",
                                           maxHeightClass = "max-h-[78vh]",
                                       }: Props) {
    const [index, setIndex] = useState(0);
    const [anim, setAnim] = useState<"idle" | "next" | "prev">("idle");
    const [showing, setShowing] = useState(0); // index đang hiển thị (để làm fade/slide)
    const containerRef = useRef<HTMLDivElement>(null);

    const total = photos?.length ?? 0;
    const safePhotos = photos ?? [];

    // preload ảnh kế cận
    const neighbors = useMemo(() => {
        if (!total) return [];
        const prev = (index - 1 + total) % total;
        const next = (index + 1) % total;
        return [safePhotos[prev]?.url, safePhotos[next]?.url].filter(Boolean) as string[];
    }, [index, total, safePhotos]);

    useEffect(() => {
        neighbors.forEach((src) => {
            const img = new window.Image();
            img.src = src;
        });
    }, [neighbors]);

    if (!total) return null;

    const goPrev = () => {
        if (anim !== "idle") return;
        const nextIdx = (index - 1 + total) % total;
        setIndex(nextIdx);
        setAnim("prev");
        // kết thúc animation sau 350ms
        setTimeout(() => {
            setShowing(nextIdx);
            setAnim("idle");
        }, 350);
    };

    const goNext = () => {
        if (anim !== "idle") return;
        const nextIdx = (index + 1) % total;
        setIndex(nextIdx);
        setAnim("next");
        setTimeout(() => {
            setShowing(nextIdx);
            setAnim("idle");
        }, 350);
    };

    // swipe (mobile)
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let startX = 0;
        let dx = 0;

        const onTouchStart = (e: TouchEvent) => {
            startX = e.touches[0].clientX;
            dx = 0;
        };
        const onTouchMove = (e: TouchEvent) => {
            dx = e.touches[0].clientX - startX;
        };
        const onTouchEnd = () => {
            if (Math.abs(dx) > 50) {
                dx < 0 ? goNext() : goPrev();
            }
        };

        el.addEventListener("touchstart", onTouchStart);
        el.addEventListener("touchmove", onTouchMove);
        el.addEventListener("touchend", onTouchEnd);
        return () => {
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
            el.removeEventListener("touchend", onTouchEnd);
        };
    }, [goNext, goPrev]);

    return (
        <div className="space-y-6">
            {/* có thể ẩn title nếu bạn không muốn hiện tên nhóm */}
            {title && (
                <h2 className="text-center text-2xl md:text-3xl font-serif">{title}</h2>
            )}

            {/* Khung preview cố định kích thước bằng aspect-ratio */}
            <div
                ref={containerRef}
                className={`relative mx-auto w-full ${maxHeightClass} aspect-[${aspect}] rounded-2xl overflow-hidden bg-black/90`}
            >
                {/* nút điều hướng */}
                <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/50 text-white p-2 md:p-3 hover:bg-black/70 transition"
                    onClick={goPrev}
                    aria-label="Previous"
                >
                    ‹
                </button>
                <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/50 text-white p-2 md:p-3 hover:bg-black/70 transition"
                    onClick={goNext}
                    aria-label="Next"
                >
                    ›
                </button>

                {/* Lớp slide: ảnh cũ và ảnh mới xếp chồng, chuyển động mượt */}
                {/* Ảnh đang hiển thị */}
                <SlideImage
                    key={`show-${showing}`}
                    src={safePhotos[showing].url}
                    state={anim === "prev" ? "to-right" : anim === "next" ? "to-left" : "stay"}
                />
                {/* Ảnh sắp tới (index) */}
                {index !== showing && (
                    <SlideImage
                        key={`incoming-${index}`}
                        src={safePhotos[index].url}
                        state={anim === "prev" ? "from-left" : "from-right"}
                    />
                )}
            </div>

            {/* Thumbnails */}
            <div className="flex justify-center gap-2 md:gap-3 overflow-x-auto">
                {safePhotos.map((p, i) => (
                    <button
                        key={p.id}
                        onClick={() => {
                            if (i === showing) return;
                            // chọn hướng animation dựa vào i
                            const forward =
                                (i > showing && !(showing === 0 && i === total - 1)) ||
                                (showing === total - 1 && i === 0);
                            setIndex(i);
                            setAnim(forward ? "next" : "prev");
                            setTimeout(() => {
                                setShowing(i);
                                setAnim("idle");
                            }, 350);
                        }}
                        className={`h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded overflow-hidden border ${
                            i === showing ? "border-white ring-2 ring-black" : "border-transparent"
                        }`}
                        aria-label={`Go to image ${i + 1}`}
                    >
                        <img src={p.url} alt="" className="h-full w-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}

/* --------- SlideImage: ảnh nằm tuyệt đối, object-contain, animate mượt --------- */

function SlideImage({
                        src,
                        state,
                    }: {
    src: string;
    state: "stay" | "from-left" | "from-right" | "to-left" | "to-right";
}) {
    // mapping class cho animation
    const base =
        "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out";
    const motion =
        state === "stay"
            ? "opacity-100 translate-x-0"
            : state === "from-left"
                ? "opacity-0 translate-x-[-12%]"
                : state === "from-right"
                    ? "opacity-0 translate-x-[12%]"
                    : state === "to-left"
                        ? "opacity-0 translate-x-[-12%]"
                        : "opacity-0 translate-x-[12%]";

    return (
        <div className={`${base} ${motion}`}>
            {/* object-contain để ảnh ngang/dọc đều fit khung mà không đổi kích thước khung */}
            <img
                src={src}
                alt=""
                className="max-w-full max-h-full w-auto h-auto object-contain"
                draggable={false}
            />
        </div>
    );
}
