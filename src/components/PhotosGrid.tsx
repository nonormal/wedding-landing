"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    PointerSensor,
    closestCenter,
    useDroppable,            // <-- quan trọng: để container nhóm nhận thả
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ------------------------- Types & constants ------------------------- */

type Photo = {
    id: string;
    url: string;
    order_index: number | null;
    created_at?: string | null;
    group_name: string;
};

const GROUPS: { key: Photo["group_name"]; label: string }[] = [
    { key: "cover",       label: "Nhóm ảnh bìa" },
    { key: "cover_mobile", label: "Nhóm ảnh bìa mobile" },
    { key: "free",        label: "Nhóm ảnh tự do" },
    { key: "concept1",    label: "Nhóm ảnh concept 1" },
    { key: "concept2",    label: "Nhóm ảnh concept 2" },
    { key: "traditional", label: "Nhóm ảnh cổ phục" },
    { key: "album",       label: "Nhóm ảnh album" },
];

/* ------------------------- Helpers ------------------------- */

function extractStoragePath(publicUrl: string) {
    const i = publicUrl.indexOf("/storage/v1/object/public/photos/");
    if (i === -1) return null;
    return publicUrl.substring(i + "/storage/v1/object/public/photos/".length);
}

/* ------------------------- Sortable item ------------------------- */

function SortableItem({
                          photo,
                          onRemove,
                      }: {
    photo: Photo;
    onRemove: (p: Photo) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: photo.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}        // GIỮ attributes cho sortable
            className="group relative h-44 w-40 overflow-hidden rounded-2xl border bg-white"
        >
            {/* Tay cầm kéo riêng, chỉ phần này nhận listeners */}
            <div
                {...listeners}
                className="absolute left-2 top-2 z-10 rounded bg-white/80 px-2 py-1 text-[10px] font-medium shadow cursor-grab active:cursor-grabbing"
                title="Kéo để sắp xếp"
            >
                ⇅
            </div>

            <img src={photo.url} alt="" className="h-full w-full object-cover" />

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-2 opacity-0 transition group-hover:opacity-100">
        <span className="rounded-full bg-white/85 px-2 py-1 text-xs">
          #{photo.order_index ?? 0}
        </span>

                <button
                    className="rounded-full bg-red-600 px-3 py-1 text-xs text-white"
                    onClick={(e) => {
                        e.preventDefault();   // tránh drag
                        e.stopPropagation();  // tránh bubble
                        onRemove(photo);
                    }}
                >
                    Xoá
                </button>
            </div>
        </div>
    );
}


/* ------------------------- Group container (droppable) ------------------------- */

function GroupContainer({
                            groupKey,
                            children,
                        }: {
    groupKey: string;
    children: React.ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: `group:${groupKey}` });
    return (
        <div
            ref={setNodeRef}
            className={`rounded-xl border p-3 transition ${
                isOver ? "bg-black/[0.04]" : "bg-white/70"
            }`}
        >
            {children}
        </div>
    );
}

/* ------------------------- Main board ------------------------- */

export default function PhotosGrid() {
    const [items, setItems] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(useSensor(PointerSensor));

    async function load() {
        setLoading(true);
        const { data, error } = await supabase
            .from("photos")
            .select("id,url,order_index,created_at,group_name")
            .order("group_name", { ascending: true })
            .order("order_index", { ascending: true, nullsFirst: true })
            .order("created_at", { ascending: true });
        if (!error) setItems((data as Photo[]) || []);
        setLoading(false);
    }

    useEffect(() => {
        load();
        const r = () => load();
        window.addEventListener("photos:changed", r);
        return () => window.removeEventListener("photos:changed", r);
    }, []);

    const byGroup = useMemo(() => {
        const map: Record<string, Photo[]> = {};
        for (const g of GROUPS) map[g.key] = [];
        for (const p of items) (map[p.group_name] ?? (map[p.group_name] = [])).push(p);
        return map;
    }, [items]);

    /* ---------- Batch persist: upsert toàn bộ thay đổi ---------- */
    async function persistBatch(newState: Photo[]) {
        setItems(newState);

        // Chuẩn hoá: trong mỗi group, đánh lại order_index 0..n
        const updates: { id: string; group_name: string; order_index: number }[] = [];
        for (const { key } of GROUPS) {
            const list = newState
                .filter((p) => p.group_name === key)
                .sort(
                    (a, b) =>
                        (a.order_index ?? 0) - (b.order_index ?? 0) ||
                        (a.created_at || "").localeCompare(b.created_at || "")
                );
            list.forEach((p, i) => updates.push({ id: p.id, group_name: key, order_index: i }));
        }

        // Chia nhỏ để update song song (tránh quá nhiều request 1 lúc)
        const CHUNK = 30;
        try {
            for (let i = 0; i < updates.length; i += CHUNK) {
                const slice = updates.slice(i, i + CHUNK);
                await Promise.all(
                    slice.map((row) =>
                        supabase
                            .from("photos")
                            .update({ group_name: row.group_name, order_index: row.order_index })
                            .eq("id", row.id)
                    )
                );
            }
        } catch (e: any) {
            console.error("Update batch error:", e);
            alert("Lưu thứ tự thất bại: " + (e?.message || "unknown"));
        }
    }

    /* ---------- drag handlers: reorder + cross-group move ---------- */

    function onDragStart(e: DragStartEvent) {
        setActiveId(String(e.active.id));
    }

    // UX: khi rê qua group khác thì gán tạm group để user thấy "đang ở hàng đó"
    function onDragOver(e: DragOverEvent) {
        const { active, over } = e;
        if (!over) return;

        const aId = String(active.id);
        const oId = String(over.id);

        const act = items.find((p) => p.id === aId);
        if (!act) return;

        if (oId.startsWith("group:")) {
            const overGroup = oId.replace("group:", "");
            if (act.group_name !== overGroup) {
                setItems((prev) =>
                    prev.map((p) =>
                        p.id === aId ? { ...p, group_name: overGroup, order_index: 9999 } : p
                    )
                );
            }
        }
    }

    async function onDragEnd(e: DragEndEvent) {
        const { active, over } = e;
        setActiveId(null);
        if (!over) return;

        const aId = String(active.id);
        const oId = String(over.id);

        // 1) Thả vào container rỗng (group:*): chuyển group & đẩy về cuối nhóm
        if (oId.startsWith("group:")) {
            const g = oId.replace("group:", "");
            const movedState = items.map((p) =>
                p.id === aId ? { ...p, group_name: g, order_index: 9999 } : p
            );
            const list = movedState.filter((p) => p.group_name === g);
            movedState.find((p) => p.id === aId)!.order_index = list.length - 1;
            await persistBatch(movedState);
            return;
        }

        // 2) Thả lên 1 ảnh khác
        const from = items.find((p) => p.id === aId);
        const to = items.find((p) => p.id === oId);
        if (!from || !to) return;

        const sameGroup = from.group_name === to.group_name;

        if (sameGroup) {
            // reorder trong cùng nhóm
            const g = from.group_name;
            const list = items.filter((p) => p.group_name === g);
            const oldIndex = list.findIndex((i) => i.id === from.id);
            const newIndex = list.findIndex((i) => i.id === to.id);
            const moved = arrayMove(list, oldIndex, newIndex);
            const newState = [
                ...items.filter((i) => i.group_name !== g),
                ...moved.map((p, idx) => ({ ...p, order_index: idx })),
            ];
            await persistBatch(newState);
        } else {
            // chuyển nhóm + chèn vào vị trí của "to"
            const targetList = items.filter((p) => p.group_name === to.group_name);
            const insertAt = targetList.findIndex((i) => i.id === to.id);

            const newState = items
                .map((p) =>
                    p.id === from.id
                        ? { ...p, group_name: to.group_name, order_index: insertAt }
                        : p
                )
                .map((p) => {
                    if (p.group_name === to.group_name && p.id !== from.id && (p.order_index ?? 0) >= insertAt) {
                        return { ...p, order_index: (p.order_index ?? 0) + 1 };
                    }
                    return p;
                });

            await persistBatch(newState);
        }
    }

    /* ------------------------- remove ------------------------- */

    async function remove(p: Photo) {
        if (!confirm("Xoá ảnh này?")) return;
        const { error } = await supabase.from("photos").delete().eq("id", p.id);
        if (error) return alert(error.message);

        const path = extractStoragePath(p.url);
        if (path) await supabase.storage.from("photos").remove([path]);

        load();
    }

    /* ------------------------- UI ------------------------- */

    return (
        <div className="space-y-6">
            {loading && <p className="p-2">Đang tải…</p>}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                {GROUPS.map((g) => {
                    const list = byGroup[g.key] ?? [];
                    return (
                        <section key={g.key} className="space-y-2">
                            <h3 className="text-sm font-semibold uppercase tracking-wide">{g.label}</h3>

                            {/* Container droppable thật sự cho group */}
                            <GroupContainer groupKey={g.key}>
                                <SortableContext
                                    items={list.map((p) => p.id)}
                                    strategy={horizontalListSortingStrategy}
                                >
                                    <div className="min-h-20 flex flex-wrap gap-2">
                                        {list.length === 0 && (
                                            <div className="grid h-20 w-full place-items-center text-xs text-neutral-500">
                                                Kéo ảnh vào đây
                                            </div>
                                        )}
                                        {list.map((p) => (
                                            <SortableItem key={p.id} photo={p} onRemove={remove} />
                                        ))}
                                    </div>
                                </SortableContext>
                            </GroupContainer>
                        </section>
                    );
                })}
            </DndContext>
        </div>
    );
}
