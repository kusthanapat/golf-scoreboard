"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type Language = "TH" | "EN" | "CN";

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Navbar({ currentLang, onLanguageChange }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const menuItems = {
    TH: {
      title: "กอล์ฟ สกอร์บอร์ด",
      home: "หน้าแรก",
      courseSetup: "กรอกข้อมูลสนาม",
      scoreEntry: "กรอกผลคะแนน",
      logout: "ออกจากระบบ",
      login: "เข้าสู่ระบบ",
    },
    EN: {
      title: "Golf Scoreboard",
      home: "Home",
      courseSetup: "Course Setup",
      scoreEntry: "Score Entry",
      logout: "Logout",
      login: "Login",
    },
    CN: {
      title: "高尔夫记分板",
      home: "首页",
      courseSetup: "球场设置",
      scoreEntry: "输入分数",
      logout: "登出",
      login: "登录",
    },
  };

  return (
    <nav className="bg-emerald-700 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo / Title */}
        <Link
          href="/home"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <h2 className="text-lg font-bold">{menuItems[currentLang].title}</h2>
        </Link>

        {/* Menu Items - Center */}
        <div className="hidden md:flex items-center gap-2">
          <NavButton href="/home" label={menuItems[currentLang].home} />
          <NavButton
            href="/course-setup"
            label={menuItems[currentLang].courseSetup}
          />
          <NavButton
            href="/score-entry"
            label={menuItems[currentLang].scoreEntry}
          />
        </div>

        {/* Right Section: Language + User */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex gap-2">
            {(["EN", "TH", "CN"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-3 py-1 rounded ${
                  currentLang === lang
                    ? "bg-white text-emerald-700"
                    : "bg-emerald-600"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold">
                  {user.user_metadata?.full_name || user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-semibold transition-colors"
              >
                {menuItems[currentLang].logout}
              </button>
            </div>
          ) : (
            <Link
              href="/"
              className="bg-white text-emerald-700 hover:bg-emerald-50 px-3 py-1 rounded text-sm font-semibold transition-colors"
            >
              {menuItems[currentLang].login}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Items */}
      <div className="md:hidden flex overflow-x-auto mt-3 gap-2">
        <MobileNavButton href="/home" label={menuItems[currentLang].home} />
        <MobileNavButton
          href="/course-setup"
          label={menuItems[currentLang].courseSetup}
        />
        <MobileNavButton
          href="/score-entry"
          label={menuItems[currentLang].scoreEntry}
        />
      </div>
    </nav>
  );
}

// ✅ ลบ icon ออก
function NavButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-emerald-600 whitespace-nowrap"
    >
      {label}
    </Link>
  );
}

// ✅ ลบ icon ออก
function MobileNavButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 transition-all whitespace-nowrap flex-shrink-0"
    >
      {label}
    </Link>
  );
}
