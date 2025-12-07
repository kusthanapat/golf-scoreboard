"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Language = "TH" | "EN" | "CN";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [lang, setLang] = useState<Language>("EN");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const dict = {
    title: { TH: "สมัครสมาชิก", EN: "Register", CN: "注册" },
    subtitle: {
      TH: "สร้างบัญชีใหม่",
      EN: "Create New Account",
      CN: "创建新账户",
    },
    name: { TH: "ชื่อ-นามสกุล", EN: "Full Name", CN: "姓名" },
    email: { TH: "อีเมล", EN: "Email", CN: "邮箱" },
    password: { TH: "รหัสผ่าน", EN: "Password", CN: "密码" },
    confirmPassword: {
      TH: "ยืนยันรหัสผ่าน",
      EN: "Confirm Password",
      CN: "确认密码",
    },
    registerButton: { TH: "สมัครสมาชิก", EN: "Register", CN: "注册" },
    haveAccount: {
      TH: "มีบัญชีอยู่แล้ว?",
      EN: "Already have an account?",
      CN: "已有账户？",
    },
    login: { TH: "เข้าสู่ระบบ", EN: "Login", CN: "登录" },
    registerWithGoogle: {
      TH: "สมัครด้วย Google",
      EN: "Register with Google",
      CN: "使用 Google 注册",
    },
    or: { TH: "หรือ", EN: "OR", CN: "或" },
    successMessage: {
      TH: "สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
      EN: "Registration successful! Please check your email to verify your account",
      CN: "注册成功！请检查您的邮箱以验证账户",
    },
  };

  async function handleEmailRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (formData.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      });

      if (error) throw error;

      setSuccess(true);

      // รอ 2 วินาทีแล้วไปหน้า login
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "สมัครสมาชิกด้วย Google ไม่สำเร็จ");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-5xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {dict.successMessage[lang]}
          </h2>
          <p className="text-gray-600 text-sm">
            กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 flex gap-2 bg-white/20 backdrop-blur-md rounded-xl p-1 shadow-lg">
        {(["EN", "TH", "CN"] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              lang === l
                ? "bg-white text-emerald-700 shadow-md"
                : "text-white hover:bg-white/20"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Register Card */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-8 text-white text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-5xl">🏌️</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{dict.title[lang]}</h1>
          <p className="text-teal-100 text-sm">{dict.subtitle[lang]}</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleEmailRegister} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                {dict.name[lang]}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"></div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-2 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                {dict.email[lang]}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"></div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-2 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                {dict.password[lang]}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"></div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-2 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                {dict.confirmPassword[lang]}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"></div>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-2 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>กำลังสมัคร...</span>
                </>
              ) : (
                dict.registerButton[lang]
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {dict.haveAccount[lang]}{" "}
            <button
              onClick={() => router.push("/")}
              className="text-emerald-600 hover:text-emerald-700 font-bold"
            >
              {dict.login[lang]}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                {dict.or[lang]}
              </span>
            </div>
          </div>

          {/* Google Register Button */}
          <button
            onClick={handleGoogleRegister}
            className="w-full bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {dict.registerWithGoogle[lang]}
          </button>
        </div>
      </div>
    </div>
  );
}
