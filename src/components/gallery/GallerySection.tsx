"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";

type Photo = {
    id: string;
    url: string;
};

export default function GallerySection({
                                           title,
                                           photos,
                                       }: {
    title?: string;
    photos: Photo[];
}) {
    const safePhotos = useMemo(() => photos ?? [], [photos]);
    const count = safePhotos.length;

    const [index, setIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // reset index khi đổi group
    useEffect(() => {
        setIndex(0);
    }, [count]);

    const goPrev = useCallback(() => {
        if (count === 0) return;
        setIndex((i) => (i - 1 + count) % count);
    }, [count]);

    const goNext = useCallback(() => {
        if (count === 0) return;
        setIndex((i) => (i + 1) % count);
    }, [count]);

    // swipe (mobile)
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let startX = 0;
        let endX = 0;

        const onTouchStart = (e: TouchEvent) => {
            startX = e.touches[0].clientX;
        };
        const onTouchMove = (e: TouchEvent) => {
            endX = e.touches[0].clientX;
        };
        const onTouchEnd = () => {
            if (startX && endX) {
                if (endX - startX > 50) goPrev();
                if (startX - endX > 50) goNext();
            }
            startX = endX = 0;
        };

        el.addEventListener("touchstart", onTouchStart);
        el.addEventListener("touchmove", onTouchMove);
        el.addEventListener("touchend", onTouchEnd);

        return () => {
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
            el.removeEventListener("touchend", onTouchEnd);
        };
    }, [goPrev, goNext]);

    const current = safePhotos[index];

    return (
        <div className="space-y-4">
            {title ? (
                <h3 className="text-center text-xl font-semibold">{title}</h3>
            ) : null}

            {/* Preview */}
            <div
                ref={containerRef}
                className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-black"
                style={{ aspectRatio: "16 / 9" }}
            >
                {count > 0 ? (
                    <img
                        key={current.id}
                        src={current.url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-contain transition-opacity duration-500"
                        draggable={false}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/70">
                        Chưa có ảnh
                    </div>
                )}

                {count > 1 && (
                    <>
                        <button
                            onClick={goPrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
                        >
                            ‹
                        </button>
                        <button
                            onClick={goNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {count > 1 && (
                <div className="mx-auto flex max-w-5xl items-center gap-3 px-4">
                    {safePhotos.map((p, i) => (
                        <button
                            key={p.id}
                            onClick={() => setIndex(i)}
                            className={`h-16 w-24 overflow-hidden rounded-lg border transition
                ${
                                i === index
                                    ? "ring-2 ring-black"
                                    : "opacity-80 hover:opacity-100"
                            }`}
                        >
                            <img
                                src={p.url}
                                alt=""
                                className="h-full w-full object-cover"
                                draggable={false}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
