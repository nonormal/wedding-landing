// src/lib/cropImage.ts
export type CropArea = { x: number; y: number; width: number; height: number };

/**
 * Cắt trực tiếp từ File/Blob gốc — chuẩn EXIF, đúng pixel
 */
export async function getCroppedBlobFromFile(
    fileOrBlob: File | Blob,
    area: CropArea,                           // areaPixels từ react-easy-crop
    mime: string = "image/webp",
    quality: number = 0.95
): Promise<Blob> {
    // Tự xoay theo EXIF để tránh lệch/đảo ảnh
    const bmp = await createImageBitmap(fileOrBlob, { imageOrientation: "from-image" });

    const sx = Math.round(area.x);
    const sy = Math.round(area.y);
    const sw = Math.round(area.width);
    const sh = Math.round(area.height);

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, sw);
    canvas.height = Math.max(1, sh);

    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, sw, sh);

    return await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("crop failed"))), mime, quality)
    );
}

/**
 * Giữ API cũ để không phá vỡ nơi đang gọi bằng dataURL.
 * Nội bộ sẽ fetch -> Blob rồi gọi getCroppedBlobFromFile.
 */
export async function getCroppedBlob(
    imageSrc: string,
    crop: CropArea,
    _rotation = 0,
    _maxWidth = 2000,               // không cần skaling ở đây nữa
    mime = "image/webp",
    quality = 0.95
): Promise<Blob> {
    const blob = await (await fetch(imageSrc, { cache: "no-store" })).blob();
    return getCroppedBlobFromFile(blob, crop, mime, quality);
}
