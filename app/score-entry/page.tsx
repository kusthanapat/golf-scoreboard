"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ScoreModal from "@/components/ScoreModal";

type Language = "TH" | "EN" | "CN";

interface Score {
  studentName: string;
  username: string;
  scores: number[];
}

export default function ScoreEntryPage() {
  const [lang, setLang] = useState<Language>("TH");
  const [scores, setScores] = useState<Score[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);

  useEffect(() => {
    fetchScores();
  }, []);

  async function fetchScores() {
    // TODO: ดึงข้อมูลจาก API
    const mockScores: Score[] = [
      {
        studentName: "กรุงเทพ",
        username: "non",
        scores: [4, 4, 4, 5, 4, 3, 4, 4, 5, 5, 7, 7, 8, 5, 3, 5, 4, 6],
      },
      {
        studentName: "กรุงเทพ",
        username: "sitthinon",
        scores: [4, 4, 5, 8, 6, 7, 7, 5, 8, 5, 5, 5, 6, 4, 6, 8, 5, 5],
      },
      {
        studentName: "กรุงเทพ",
        username: "goft",
        scores: [5, 7, 8, 5, 6, 3, 5, 4, 6, 7, 5, 6, 4, 5, 6, 5, 5, 5],
      },
      {
        studentName: "ชลบุรี",
        username: "Data",
        scores: [5, 6, 6, 7, 8, 6, 4, 5, 6, 3, 5, 4, 5, 7, 8, 9, 6, 4],
      },
    ];
    setScores(mockScores);
  }

  function handleAddScore() {
    setEditingScore(null);
    setIsModalOpen(true);
  }

  function handleEditScore(score: Score) {
    setEditingScore(score);
    setIsModalOpen(true);
  }

  function handleDeleteScore(username: string) {
    if (confirm("คุณต้องการลบคะแนนนี้ใช่หรือไม่?")) {
      setScores(scores.filter((s) => s.username !== username));
      // TODO: ลบจาก Google Sheets
    }
  }

  function handleSaveScore(score: Score) {
    if (editingScore) {
      setScores(
        scores.map((s) => (s.username === editingScore.username ? score : s))
      );
    } else {
      setScores([...scores, score]);
    }
    setIsModalOpen(false);
    // TODO: บันทึกไปยัง Google Sheets
  }

  const dict = {
    title: { TH: "จัดการสกอร์", EN: "Manage Scores", CN: "管理分数" },
    addButton: { TH: "เพิ่มสกอร์", EN: "Add Score", CN: "添加分数" },
    studentName: { TH: "สนาม", EN: "Course", CN: "球场" },
    username: { TH: "ผู้เล่น", EN: "Player", CN: "球员" },
    scores: {
      TH: "คะแนนสกอร์ (หลุม 1-18)",
      EN: "Scores (Holes 1-18)",
      CN: "分数 (1-18洞)",
    },
    actions: { TH: "จัดการ", EN: "Actions", CN: "操作" },
    edit: { TH: "แก้ไข", EN: "Edit", CN: "编辑" },
    delete: { TH: "ลบ", EN: "Delete", CN: "删除" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar currentLang={lang} onLanguageChange={setLang} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            {dict.title[lang]}
          </h1>
          <button
            onClick={handleAddScore}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-all"
          >
            <span className="text-xl">+</span>
            {dict.addButton[lang]}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    {dict.studentName[lang]}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    {dict.username[lang]}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    {dict.scores[lang]}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    {dict.actions[lang]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scores.map((score, index) => (
                  <tr
                    key={index}
                    className="hover:bg-emerald-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {score.studentName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {score.username}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {score.scores.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-800 rounded text-xs font-bold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditScore(score)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          {dict.edit[lang]}
                        </button>
                        <button
                          onClick={() => handleDeleteScore(score.username)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          {dict.delete[lang]}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {scores.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">ยังไม่มีข้อมูลคะแนน</p>
              <p className="text-sm mt-2">
                คลิกปุ่ม "เพิ่มสกอร์" เพื่อเริ่มต้น
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <ScoreModal
          score={editingScore}
          onSave={handleSaveScore}
          onClose={() => setIsModalOpen(false)}
          lang={lang}
        />
      )}
    </div>
  );
}
