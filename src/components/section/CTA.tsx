export default function CTA() {
    return (
        <section id="rsvp" className="py-16">
            <div className="max-w-3xl mx-auto px-4 md:px-6 text-center space-y-4">
                <h2 className="font-serif text-3xl md:text-4xl">Rất mong được gặp bạn</h2>
                <p className="text-gray-700">Bạn có thể xác nhận tham dự qua Messenger.</p>
                <div className="pt-2">
                    <a href="https://m.me/YOUR_PAGE_OR_PROFILE" target="_blank"
                       className="rounded-full bg-black text-white px-6 py-3 inline-block">
                        RSVP qua Messenger
                    </a>
                </div>
            </div>
        </section>
    );
}
