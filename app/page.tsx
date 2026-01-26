"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Language = "TH" | "EN" | "CN";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [lang, setLang] = useState<Language>("EN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OAuth callback handler
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      setLoading(true);

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.push("/home");
          router.refresh();
        } else {
          setLoading(false);
        }
      });
    }
  }, [router, supabase]);

  const dict = {
    title: { TH: "เข้าสู่ระบบ", EN: "Login", CN: "登录" },
    subtitle: {
      TH: "ระบบจัดการคะแนนกอล์ฟ",
      EN: "Golf Tournament Management",
      CN: "高尔夫赛事管理",
    },
    email: { TH: "อีเมล", EN: "Email", CN: "邮箱" },
    password: { TH: "รหัสผ่าน", EN: "Password", CN: "密码" },
    loginButton: { TH: "เข้าสู่ระบบ", EN: "Login", CN: "登录" },
    forgotPassword: {
      TH: "ลืมรหัสผ่าน?",
      EN: "Forgot Password?",
      CN: "忘记密码？",
    },
    noAccount: {
      TH: "ยังไม่มีบัญชี?",
      EN: "Don't have an account?",
      CN: "还没有账户？",
    },
    register: { TH: "สมัครสมาชิก", EN: "Register", CN: "注册" },
    welcome: { TH: "ยินดีต้อนรับ", EN: "Welcome Back", CN: "欢迎回来" },
    emailPlaceholder: {
      TH: "กรอกอีเมลของคุณ",
      EN: "Enter your email",
      CN: "输入您的邮箱",
    },
    passwordPlaceholder: {
      TH: "กรอกรหัสผ่าน",
      EN: "Enter your password",
      CN: "输入密码",
    },
    loginWithGoogle: {
      TH: "เข้าสู่ระบบด้วย Google",
      EN: "Login with Google",
      CN: "使用 Google 登录",
    },
    or: { TH: "หรือ", EN: "OR", CN: "或" },
  };

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/home");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setLoading(true);

      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "/auth/callback";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError(err.message || "เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center p-4">
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

      {/* Login Card */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-5xl">⛳</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{dict.welcome[lang]}</h1>
          <p className="text-emerald-100 text-sm">{dict.subtitle[lang]}</p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleEmailLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                {dict.email[lang]}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder={dict.emailPlaceholder[lang]}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                {dict.password[lang]}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder={dict.passwordPlaceholder[lang]}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold"
                disabled={loading}
              >
                {dict.forgotPassword[lang]}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <span>{dict.loginButton[lang]}</span>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {dict.noAccount[lang]}{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-emerald-600 hover:text-emerald-700 font-bold"
              disabled={loading}
            >
              {dict.register[lang]}
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

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {dict.loginWithGoogle[lang]}
          </button>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-500 border-t border-gray-200">
          © 2024 Golf Tournament System. All rights reserved.
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </div>
  );
}
