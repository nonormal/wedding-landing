export default function AdminCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border bg-white/80 backdrop-blur p-5 shadow-sm dark:bg-neutral-900/70">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                {title}
            </h2>
            <div className="space-y-3">{children}</div>
        </section>
    );
}
