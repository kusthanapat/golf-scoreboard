"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

// --- Type Definitions ---
type Language = "TH" | "EN" | "CN";

interface PlayerInput {
  name: string;
  net: number;
  hcp: number;
  scores: number[];
}

interface ApiResponse {
  players: PlayerInput[];
  pars: number[];
  stadiums: string[];
}

export default function HomePage() {
  const [lang, setLang] = useState<Language>("EN");
  const [players, setPlayers] = useState<PlayerInput[]>([]);
  const [pars, setPars] = useState<number[]>([
    4, 4, 5, 3, 4, 4, 3, 5, 4, 5, 4, 3, 4, 4, 4, 3, 4, 5,
  ]);
  const [stadiums, setStadiums] = useState<string[]>(
    Array.from({ length: 18 }, (_, i) => `S.${i + 1}`)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // ฟังก์ชันดึงข้อมูลแบบ silent (ไม่แสดง loading)
  async function fetchGoogleSheetData(silent = false) {
    try {
      if (!silent) {
        setLoading(true);
      }

      const response = await fetch("/api/sheets");

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data: ApiResponse = await response.json();

      if (data.players) {
        setPlayers(data.players);
        setError(null);
        setLastUpdate(new Date());
      }

      if (data.pars && data.pars.length === 18) {
        setPars(data.pars);
      }

      if (data.stadiums && data.stadiums.length === 18) {
        setStadiums(data.stadiums);
      }

      if (!silent) {
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      if (!silent) {
        setError(err.message || "ไม่สามารถดึงข้อมูลจาก Google Sheets ได้");
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    // โหลดครั้งแรก
    fetchGoogleSheetData();

    // Auto-refresh ทุก 30 วินาที แบบ silent (ไม่แสดง loading)
    const interval = setInterval(() => {
      fetchGoogleSheetData(true); // ส่ง silent = true
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const dict = {
    name: { TH: "ชื่อนักกอล์ฟ", EN: "Player", CN: "姓名" },
    net: { TH: "สุทธิ", EN: "Net", CN: "净杆" },
    hcp: { TH: "แต้มต่อ", EN: "Hcp", CN: "差点" },
    out: { TH: "ออก", EN: "OUT", CN: "前九" },
    in: { TH: "เข้า", EN: "IN", CN: "后九" },
    total: { TH: "รวม", EN: "Tot", CN: "总杆" },
  };

  // ฟังก์ชันแสดงเวลาอัปเดตล่าสุด
  function formatLastUpdate() {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdate.toLocaleTimeString();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 text-center">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-bold mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchGoogleSheetData()}
              className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700"
            >
              ลองอีกครั้ง
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 font-sans text-gray-900">
      <Navbar currentLang={lang} onLanguageChange={setLang} />

      <main className="w-full px-2 md:px-4 py-6">
        <div className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <span>⛳</span> Tournament Scoreboard
              </h1>
              <p className="text-emerald-100 text-sm mt-1 flex items-center gap-2">
                Amata Spring Country Club • Live Data
                <span className="inline-flex items-center gap-1 bg-emerald-800/50 px-2 py-0.5 rounded-full text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Updated {formatLastUpdate()}
                </span>
              </p>
            </div>
            <div className="text-right text-white">
              <div className="text-xs font-bold uppercase opacity-80">
                Par Total
              </div>
              <div className="text-4xl font-bold">
                {pars.reduce((a, b) => a + b, 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-xl border border-gray-200 p-1 overflow-x-auto">
          <table className="w-full border-collapse table-fixed min-w-[1200px]">
            <thead>
              {/* แถวที่ 1: ชื่อสนาม (S.1 - S.18) */}
              <tr className="bg-slate-700 text-white text-[9px] md:text-[10px] uppercase">
                <th className="p-1 text-left bg-slate-900"></th>
                <th className="p-1 bg-emerald-800"></th>
                <th className="p-1 bg-slate-700 border-r border-slate-600"></th>

                {stadiums.map((stadium, i) => (
                  <th
                    key={i}
                    className={`p-1 ${
                      i < 9
                        ? "bg-amber-900/30 text-amber-200"
                        : "bg-blue-900/30 text-blue-200"
                    } ${i === 8 ? "border-r border-slate-600" : ""}`}
                  >
                    {stadium || `S.${i + 1}`}
                  </th>
                ))}

                <th className="p-1 bg-amber-900/50"></th>
                <th className="p-1 bg-blue-900/50"></th>
                <th className="p-1 bg-emerald-600"></th>
              </tr>

              {/* แถวที่ 2: Header หลัก + PAR */}
              <tr className="bg-slate-800 text-white text-[10px] md:text-xs uppercase tracking-tighter">
                <th className="p-2 text-left w-[15%] bg-slate-900">
                  {dict.name[lang]}
                </th>
                <th className="p-1 w-[5%] bg-emerald-800">{dict.net[lang]}</th>
                <th className="p-1 w-[4%] bg-slate-700 border-r border-slate-600">
                  {dict.hcp[lang]}
                </th>

                {pars.map((par, i) => (
                  <th
                    key={i}
                    className={`p-1 border-b-2 ${
                      i < 9 ? "border-amber-500" : "border-blue-500"
                    } ${i === 8 ? "border-r border-slate-600" : ""}`}
                  >
                    <span className="text-sm md:text-base font-bold text-white">
                      {par}
                    </span>
                  </th>
                ))}

                <th className="p-1 w-[5%] bg-amber-900/50 text-amber-200">
                  {dict.out[lang]}
                </th>
                <th className="p-1 w-[5%] bg-blue-900/50 text-blue-200">
                  {dict.in[lang]}
                </th>
                <th className="p-1 w-[6%] bg-emerald-600 font-bold text-white">
                  {dict.total[lang]}
                </th>
              </tr>
            </thead>

            <tbody className="text-xs md:text-sm font-medium text-gray-700">
              {players.map((player, idx) => {
                const outScore = player.scores
                  .slice(0, 9)
                  .reduce((a, b) => a + b, 0);
                const inScore = player.scores
                  .slice(9, 18)
                  .reduce((a, b) => a + b, 0);
                const totalScore = outScore + inScore;

                return (
                  <tr
                    key={idx}
                    className={`border-b border-gray-100 hover:bg-emerald-50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <td className="p-2 text-left truncate border-r border-gray-200 font-bold text-gray-900">
                      {player.name}
                    </td>

                    <td className="p-1 text-center font-bold text-emerald-700 bg-emerald-50/50">
                      {player.net}
                    </td>
                    <td className="p-1 text-center text-gray-500 border-r border-gray-200 text-[11px]">
                      {player.hcp}
                    </td>

                    {/* คะแนนแต่ละหลุม - ไม่มี highlight */}
                    {player.scores.map((score, i) => (
                      <td
                        key={i}
                        className={`p-1 text-center text-gray-700 font-medium ${
                          i === 8 ? "border-r border-gray-200" : ""
                        }`}
                      >
                        {score}
                      </td>
                    ))}

                    <td className="p-1 text-center font-bold text-amber-800 bg-amber-50/50 border-l border-gray-200">
                      {outScore}
                    </td>
                    <td className="p-1 text-center font-bold text-blue-800 bg-blue-50/50 border-r border-gray-200">
                      {inScore}
                    </td>
                    <td className="p-1 text-center font-black text-gray-900 bg-gray-100/50 text-base">
                      {totalScore}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ลบ Legend ด้านล่างออก */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Auto-refresh every 30s
          </div>
        </div>
      </main>
    </div>
  );
}
