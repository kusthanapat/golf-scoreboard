"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchableDropdown from "@/components/SearchableDropdown";
import provinces from "@/data/provinces.json";

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
  locationNotFound?: boolean;
}

interface RankingPlayer {
  name: string;
  difference: number;
  confirmed: number;
  rank?: number;
}

interface RankingResponse {
  groupA: RankingPlayer[];
  groupB: RankingPlayer[];
  groupC: RankingPlayer[];
  totalPar: number;
}

export default function HomePage() {
  const [lang, setLang] = useState<Language>("EN");
  const [selectedLocation, setSelectedLocation] = useState<string>("Bangkok");
  const [players, setPlayers] = useState<PlayerInput[]>([]);
  const [pars, setPars] = useState<number[]>([]);
  const [stadiums, setStadiums] = useState<string[]>(
    Array.from({ length: 18 }, (_, i) => `S.${i + 1}`)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [locationNotFound, setLocationNotFound] = useState(false);

  // Ranking states
  const [showRankings, setShowRankings] = useState(false);
  const [rankingData, setRankingData] = useState<RankingResponse | null>(null);
  const [calculatingRanking, setCalculatingRanking] = useState(false);

  // ฟังก์ชันดึงข้อมูลตาม location
  async function fetchGoogleSheetData(silent = false) {
    try {
      if (!silent) {
        setLoading(true);
      }

      const response = await fetch(
        `/api/sheets?location=${encodeURIComponent(selectedLocation)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data: ApiResponse = await response.json();

      // ตั้งค่า locationNotFound flag
      setLocationNotFound(data.locationNotFound || false);

      if (data.players) {
        setPlayers(data.players);
        setError(null);
        setLastUpdate(new Date());
      }

      if (data.pars) {
        setPars(data.pars);
      }

      if (data.stadiums) {
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

  // โหลดข้อมูลเมื่อเปลี่ยน location
  useEffect(() => {
    fetchGoogleSheetData();
    setShowRankings(false);

    const interval = setInterval(() => {
      fetchGoogleSheetData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedLocation]);

  // ฟังก์ชันคำนวณ Ranking
  async function handleCalculateRanking() {
    // ตรวจสอบว่ามี PAR หรือไม่
    if (pars.length === 0 || locationNotFound) {
      alert("ไม่สามารถคำนวณอันดับได้ เนื่องจากไม่พบข้อมูลสนาม");
      return;
    }

    try {
      setCalculatingRanking(true);

      const response = await fetch("/api/calculate-ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: selectedLocation }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate ranking");
      }

      const data: RankingResponse = await response.json();
      setRankingData(data);
      setShowRankings(true);
    } catch (err: any) {
      console.error("Error calculating ranking:", err);
      alert("เกิดข้อผิดพลาดในการคำนวณอันดับ: " + err.message);
    } finally {
      setCalculatingRanking(false);
    }
  }

  const dict = {
    name: { TH: "ชื่อนักกอล์ฟ", EN: "Player", CN: "姓名" },
    net: { TH: "สุทธิ", EN: "Net", CN: "净杆" },
    hcp: { TH: "แต้มต่อ", EN: "Hcp", CN: "差点" },
    out: { TH: "ออก", EN: "OUT", CN: "前九" },
    in: { TH: "เข้า", EN: "IN", CN: "后九" },
    total: { TH: "รวม", EN: "Tot", CN: "总杆" },
    selectLocation: { TH: "เลือกสนาม", EN: "Select Course", CN: "选择球场" },
    calculateRanking: {
      TH: "คำนวณอันดับ",
      EN: "Calculate Ranking",
      CN: "计算排名",
    },
    difference: { TH: "ผลต่าง", EN: "Difference", CN: "差點" },
    confirmed: { TH: "ยืนยัน", EN: "Confirmed", CN: "確定" },
    rank: { TH: "อันดับ", EN: "Rank", CN: "排名" },
    groupA: { TH: "กลุ่ม A (0-12)", EN: "Group A (0-12)", CN: "A组 (0-12)" },
    groupB: {
      TH: "กลุ่ม B (12.1-24)",
      EN: "Group B (12.1-24)",
      CN: "B组 (12.1-24)",
    },
    groupC: {
      TH: "กลุ่ม C (24.1-36)",
      EN: "Group C (24.1-36)",
      CN: "C组 (24.1-36)",
    },
    locationNotFoundMsg: {
      TH: `ไม่พบข้อมูลสนาม "${selectedLocation}" ใน Sheet Name_stadium`,
      EN: `Location "${selectedLocation}" not found in Name_stadium sheet`,
      CN: `在 Name_stadium 工作表中未找到 "${selectedLocation}"`,
    },
  };

  function formatLastUpdate() {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdate.toLocaleTimeString();
  }

  // Ranking Table Component
  function RankingTable({
    title,
    players,
  }: {
    title: string;
    players: RankingPlayer[];
  }) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1 min-w-[300px]">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  {dict.name[lang]}
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">
                  {dict.difference[lang]}
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">
                  {dict.confirmed[lang]}
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">
                  {dict.rank[lang]}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {players.length > 0 ? (
                players.map((player, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-emerald-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                      {player.name}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {player.difference.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {player.confirmed.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">
                        {player.rank}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    ไม่มีผู้เล่นในกลุ่มนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
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
        {/* Tournament Scoreboard Header - Responsive */}
        <div className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg p-4 md:p-6">
          {/* Mobile Layout */}
          <div className="md:hidden space-y-4">
            {/* Row 1: Title */}
            <div className="text-white">
              <h1 className="text-xl font-bold flex items-center gap-2">
                Tournament Scoreboard
              </h1>
              <p className="text-emerald-100 text-xs mt-1 flex items-center gap-2">
                {selectedLocation} • Live Data
                <span className="inline-flex items-center gap-1 bg-emerald-800/50 px-2 py-0.5 rounded-full text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {formatLastUpdate()}
                </span>
              </p>
            </div>

            {/* Row 2: Location Dropdown */}
            <div className="w-full">
              <SearchableDropdown
                value={selectedLocation}
                onChange={setSelectedLocation}
                options={provinces}
                placeholder="Select location..."
                label=""
              />
            </div>

            {/* Row 3: Par Total & Calculate Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCalculateRanking}
                disabled={calculatingRanking || locationNotFound}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {calculatingRanking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>คำนวณ...</span>
                  </>
                ) : (
                  <span>{dict.calculateRanking[lang]}</span>
                )}
              </button>

              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center min-w-[80px]">
                <div className="text-xs font-bold uppercase text-white/80">
                  Par
                </div>
                <div className="text-2xl font-bold text-white">
                  {pars.length > 0 ? pars.reduce((a, b) => a + b, 0) : "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Hidden on Mobile */}
          <div className="hidden md:flex justify-between items-center gap-4">
            <div className="text-white flex-1">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                Tournament Scoreboard
              </h1>
              <p className="text-emerald-100 text-sm mt-1 flex items-center gap-2">
                {selectedLocation} • Live Data
                <span className="inline-flex items-center gap-1 bg-emerald-800/50 px-2 py-0.5 rounded-full text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Updated {formatLastUpdate()}
                </span>
              </p>
            </div>

            {/* Location Dropdown */}
            <div className="w-64">
              <SearchableDropdown
                value={selectedLocation}
                onChange={setSelectedLocation}
                options={provinces}
                placeholder="Select location..."
                label=""
              />
            </div>

            {/* Calculate Ranking Button */}
            <button
              onClick={handleCalculateRanking}
              disabled={calculatingRanking || locationNotFound}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calculatingRanking ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>กำลังคำนวณ...</span>
                </>
              ) : (
                <span>{dict.calculateRanking[lang]}</span>
              )}
            </button>

            <div className="text-right text-white">
              <div className="text-xs font-bold uppercase opacity-80">
                Par Total
              </div>
              <div className="text-4xl font-bold">
                {pars.length > 0 ? pars.reduce((a, b) => a + b, 0) : "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Scoreboard Table - เหมือนเดิม */}
        <div className="bg-white shadow-xl rounded-xl border border-gray-200 p-1 overflow-x-auto mb-4">
          <table className="w-full border-collapse table-fixed min-w-[1200px]">
            {/* ... table content เหมือนเดิม ... */}
          </table>
        </div>

        {/* Warning Message - เหมือนเดิม */}
        {locationNotFound && (
          <div className="mb-8 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-orange-800 font-medium text-sm">
                {dict.locationNotFoundMsg[lang]}
              </p>
            </div>
          </div>
        )}

        {/* Ranking Tables - เหมือนเดิม */}
        {showRankings && rankingData && (
          <div className="mt-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              {dict.calculateRanking[lang]}
            </h2>

            <div className="flex flex-col md:flex-row flex-wrap gap-6">
              <RankingTable
                title={dict.groupA[lang]}
                players={rankingData.groupA}
              />
              <RankingTable
                title={dict.groupB[lang]}
                players={rankingData.groupB}
              />
              <RankingTable
                title={dict.groupC[lang]}
                players={rankingData.groupC}
              />
            </div>
          </div>
        )}

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
