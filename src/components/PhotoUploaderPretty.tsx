"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ImageCropModal from "@/components/ImageCropModal";
import type { Area as CropArea } from "react-easy-crop";
import { getCroppedBlobFromFile } from "@/lib/cropImage";

async function compressImage(
    fileOrBlob: File | Blob,
    {
        maxSide = 2000,
        targetBytes = 2 * 1024 * 1024,
        mime = "image/webp",
        qualityStart = 0.9,
        qualityMin = 0.5,
        step = 0.08,
    } = {}
): Promise<Blob> {
    const bitmap = await createImageBitmap(fileOrBlob, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const nw = Math.max(1, Math.round(bitmap.width * scale));
    const nh = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = nw;
    canvas.height = nh;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, nw, nh);

    let q = qualityStart;
    let out: Blob | null = null;
    while (q >= qualityMin) {
        out = await new Promise<Blob>((resolve) =>
            canvas.toBlob((b) => resolve(b as Blob), mime, q)
        );
        if (out && out.size <= targetBytes) break;
        q -= step;
    }
    return out as Blob;
}

type Props = { defaultGroup?: string };

export default function PhotoUploaderPretty({ defaultGroup = "free" }: Props) {
    const [drag, setDrag] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
    const [msg, setMsg] = useState<string | null>(null);

    const [cropOpen, setCropOpen] = useState(false);
    const [dataUrl, setDataUrl] = useState<string>("");
    const [rawFile, setRawFile] = useState<File | null>(null);

    async function openCrop(files: FileList | null) {
        const file = files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setMsg("Vui lòng chọn file ảnh.");
            return;
        }
        setRawFile(file); // lưu file gốc để crop/upload
        const reader = new FileReader();
        reader.onload = () => {
            setDataUrl(reader.result as string);
            setCropOpen(true);
        };
        reader.readAsDataURL(file);
    }

    async function doInsert(path: string) {
        const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
        const { error: dbErr } = await supabase.from("photos").insert({
            url: pub.publicUrl,
            caption: null,
            order_index: 0,
            group_name: defaultGroup,
        });
        if (dbErr) throw dbErr;
    }

    async function uploadBlobToStorage(blob: Blob) {
        setProgress(5);
        const compressed = await compressImage(blob, {
            maxSide: 2000,
            targetBytes: 2 * 1024 * 1024,
        });

        const path = `wedding/${Date.now()}.webp`;
        const timer = setInterval(
            () => setProgress((p) => (p && p < 90 ? p + 5 : p)),
            120
        );

        const { error: upErr } = await supabase.storage
            .from("photos")
            .upload(path, compressed, {
                cacheControl: "3600",
                upsert: false,
                contentType: "image/webp",
            });

        clearInterval(timer);
        if (upErr) throw upErr;

        await doInsert(path);

        setProgress(100);
        setMsg("Đã upload thành công!");
        setTimeout(() => setProgress(null), 700);
        window.dispatchEvent(new CustomEvent("photos:changed"));
    }

    async function uploadCropped(area: CropArea) {
        if (!rawFile) return;
        try {
            setMsg(null);
            const croppedBlob = await getCroppedBlobFromFile(rawFile, area);
            await uploadBlobToStorage(croppedBlob);
        } catch (e: any) {
            setProgress(null);
            setMsg(e?.message || "Lỗi upload");
        }
    }

    async function uploadDirect() {
        if (!rawFile) return;
        try {
            setMsg(null);
            await uploadBlobToStorage(rawFile);
        } catch (e: any) {
            setProgress(null);
            setMsg(e?.message || "Lỗi upload trực tiếp");
        }
    }

    return (
        <>
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDrag(false);
                    openCrop(e.dataTransfer.files);
                }}
                className={`rounded-xl border p-6 text-center cursor-pointer transition ${
                    drag ? "border-dashed bg-neutral-50" : "bg-white/60"
                }`}
            >
                <input
                    id="file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => openCrop(e.target.files)}
                />
                <label htmlFor="file" className="block">
                    <div className="font-medium">Kéo thả ảnh vào đây</div>
                    <div className="text-sm text-neutral-600">
                        Hệ thống sẽ tự nén &amp; resize (≈ 2MB)
                    </div>
                    <span className="mt-3 inline-block rounded-full border px-4 py-2">
            Chọn ảnh…
          </span>
                </label>

                {progress !== null && (
                    <div className="mt-4 text-left">
                        <div className="h-2 w-full overflow-hidden rounded bg-neutral-200">
                            <div
                                className="h-2 bg-neutral-900 transition-[width]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="mt-1 text-xs text-neutral-600">{progress}%</div>
                    </div>
                )}
                {msg && <p className="mt-3 text-sm">{msg}</p>}
            </div>

            {/* MODAL CROP */}
            <ImageCropModal
                src={dataUrl}
                open={cropOpen}
                onClose={() => setCropOpen(false)}
                onDone={async (result) => {
                    setCropOpen(false);
                    if (result === "direct") {
                        await uploadDirect();
                    } else {
                        await uploadCropped(result as CropArea);
                    }
                }}
            />
        </>
    );
}
