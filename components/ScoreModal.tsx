"use client";

import { useState, useEffect } from "react";
import provinces from "@/data/provinces.json";
import SearchableDropdown from "./SearchableDropdown";

type Language = "TH" | "EN" | "CN";

interface Score {
  rowIndex?: number;
  location: string;
  playerName: string;
  scores: number[];
}

interface ScoreModalProps {
  score: Score | null;
  onSave: (score: Score) => void;
  onClose: () => void;
  lang: Language;
}

export default function ScoreModal({
  score,
  onSave,
  onClose,
  lang,
}: ScoreModalProps) {
  const [location, setLocation] = useState("Bangkok");
  const [playerName, setPlayerName] = useState("");
  const [scores, setScores] = useState<(number | "")[]>(Array(18).fill(""));

  useEffect(() => {
    if (score) {
      setLocation(score.location);
      setPlayerName(score.playerName);
      setScores(score.scores);
    } else {
      setLocation("Bangkok");
      setPlayerName("");
      setScores(Array(18).fill(""));
    }
  }, [score]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const hasEmptyScore = scores.some(
      (s) => s === "" || s === null || s === undefined
    );
    if (hasEmptyScore) {
      alert("กรุณากรอกคะแนนให้ครบทุกหลุม");
      return;
    }

    const newScore: Score = {
      ...(score?.rowIndex && { rowIndex: score.rowIndex }),
      location,
      playerName,
      scores: scores.map((s) =>
        typeof s === "number" ? s : parseInt(String(s))
      ),
    };

    onSave(newScore);
  }

  function updateScore(index: number, value: string) {
    const newScores = [...scores];
    newScores[index] = value === "" ? "" : parseInt(value);
    setScores(newScores);
  }

  const dict = {
    title: {
      TH: score ? "แก้ไขคะแนน" : "เพิ่มคะแนน",
      EN: score ? "Edit Score" : "Add Score",
      CN: score ? "编辑分数" : "添加分数",
    },
    selectCourse: { TH: "เลือกสนาม", EN: "Select Course", CN: "选择球场" },
    playerName: { TH: "ชื่อผู้เล่น", EN: "Player Name", CN: "球员姓名" },
    scoresLabel: {
      TH: "คะแนนทั้งหมด 18 หลุม",
      EN: "All 18 Holes Scores",
      CN: "全部18洞分数",
    },
    cancel: { TH: "ปิด", EN: "Cancel", CN: "取消" },
    save: { TH: "บันทึก", EN: "Save", CN: "保存" },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {dict.title[lang]}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* เลือกสนาม */}
          <div className="mb-6">
            <SearchableDropdown
              value={location}
              onChange={setLocation}
              options={provinces}
              placeholder="Type to search..."
              label={dict.selectCourse[lang]}
              required
            />
          </div>

          {/* ชื่อผู้เล่น */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              {dict.playerName[lang]}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="กรอกชื่อผู้เล่น"
              required
            />
          </div>

          {/* คะแนน 18 หลุม */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">
              {dict.scoresLabel[lang]}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {scores.map((s, idx) => (
                <div key={idx}>
                  <label className="block text-sm text-gray-600 mb-1">
                    Hole {idx + 1}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={s}
                    onChange={(e) => updateScore(idx, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="-"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all"
            >
              {dict.cancel[lang]}
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              {dict.save[lang]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
