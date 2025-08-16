"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

const schema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Tối thiểu 6 ký tự"),
});
type FormData = z.infer<typeof schema>;

export default function SignInForm() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (values: FormData) => {
        setError(null);
        const { error } = await supabase.auth.signInWithPassword(values);
        if (error) setError(error.message);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
                <label className="block text-sm mb-1">Email</label>
                <input className="w-full border rounded-lg px-3 py-2"
                       type="email" {...register("email")} />
                {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
            </div>
            <div>
                <label className="block text-sm mb-1">Mật khẩu</label>
                <input className="w-full border rounded-lg px-3 py-2"
                       type="password" {...register("password")} />
                {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button disabled={isSubmitting}
                    className="rounded-full border px-4 py-2">
                {isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>
        </form>
    );
}
