"use client";

import { useEffect, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import Portal from "@/components/Portal";

type Props = {
    src: string;                 // dataURL hoặc objectURL của ảnh
    open: boolean;
    onClose: () => void;
    // NEW: có thể trả về "direct" để upload ảnh gốc, hoặc trả về areaPixels khi crop
    onDone: (result: Area | "direct") => void;
};

const ASPECT_OPTIONS = [
    { value: 16 / 9, label: "16:9 (Desktop hero)" },
    { value: 9 / 16, label: "9:16 (Mobile hero)" },
    { value: 4 / 3, label: "4:3" },
    { value: 1, label: "1:1" },
];

export default function ImageCropModal({ src, open, onClose, onDone }: Props) {
    // Khoá scroll nền khi mở
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState(16 / 9);
    const [areaPixels, setAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_area: Area, pixels: Area) => {
        setAreaPixels(pixels);
    }, []);

    if (!open) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999]">
                <div className="absolute inset-0 bg-black/60" onClick={onClose} />

                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                    <div className="w-[92vw] max-w-[780px] rounded-2xl bg-white shadow-2xl overflow-hidden pointer-events-auto">
                        <div className="relative h-[60vh] bg-black">
                            {src && (
                                <Cropper
                                    image={src}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={aspect}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                    objectFit="contain"
                                />
                            )}
                        </div>

                        <div className="p-4 flex flex-wrap items-center gap-3">
                            <label className="text-sm">Tỉ lệ:</label>
                            <select
                                className="rounded border px-2 py-1 text-sm"
                                value={aspect}
                                onChange={(e) => setAspect(Number(e.target.value))}
                            >
                                {ASPECT_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    className="rounded-full px-4 py-2 bg-neutral-100"
                                    onClick={onClose}
                                >
                                    Huỷ
                                </button>

                                <button
                                    className="rounded-full px-4 py-2 border border-neutral-300"
                                    onClick={() => onDone("direct")}
                                >
                                    Tải lên trực tiếp
                                </button>

                                <button
                                    className="rounded-full px-4 py-2 bg-black text-white"
                                    onClick={() => {
                                        if (!areaPixels) return;
                                        onDone(areaPixels);
                                    }}
                                >
                                    Cắt & tải lên
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
