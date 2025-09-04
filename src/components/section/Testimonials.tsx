export default function Testimonials() {
    return (
        <section className="py-16 bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-3 gap-6">
                {[
                    "Ngày tuyệt vời! Thiệp online đẹp và dễ xem.",
                    "Thiết kế tinh tế, xem trên điện thoại rất mượt.",
                    "Rất thích phần gallery và lưu vào lịch."
                ].map((q, i) => (
                    <figure key={i} className="border rounded-2xl p-6 bg-white shadow-sm">
                        <blockquote className="text-gray-700">“{q}”</blockquote>
                    </figure>
                ))}
            </div>
        </section>
    );
}
