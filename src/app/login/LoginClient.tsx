"use client";

export default function LoginClient({
                                        redirectedFrom,
                                    }: {
    redirectedFrom?: string;
}) {
    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Đăng nhập</h1>

            <form className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium">
                        Mật khẩu
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-md"
                >
                    Đăng nhập
                </button>
            </form>

            {redirectedFrom && (
                <p className="mt-4 text-sm text-gray-500">
                    Bạn được chuyển hướng từ: <b>{redirectedFrom}</b>
                </p>
            )}
        </div>
    );
}
