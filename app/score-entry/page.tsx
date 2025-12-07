"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ScoreModal from "@/components/ScoreModal";
import { createClient } from "@/lib/supabase/client";

type Language = "TH" | "EN" | "CN";

interface Score {
  rowIndex?: number;
  timestamp?: string;
  email?: string;
  location: string;
  playerName: string;
  scores: number[];
}

export default function ScoreEntryPage() {
  const [lang, setLang] = useState<Language>("TH");
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  const supabase = createClient();

  useEffect(() => {
    fetchScores();
    getCurrentUser();
  }, []);

  async function getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  }

  async function fetchScores() {
    try {
      setLoading(true);
      const response = await fetch("/api/form-scores");
      const data = await response.json();

      if (data.scores) {
        setScores(data.scores);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching scores:", error);
      setLoading(false);
    }
  }

  function handleAddScore() {
    setEditingScore(null);
    setIsModalOpen(true);
  }

  function handleEditScore(score: Score) {
    setEditingScore(score);
    setIsModalOpen(true);
  }

  async function handleDeleteScore(rowIndex: number, playerName: string) {
    if (confirm(`คุณต้องการลบคะแนนของ ${playerName} ใช่หรือไม่?`)) {
      try {
        const response = await fetch(`/api/form-scores?rowIndex=${rowIndex}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setScores(scores.filter((s) => s.rowIndex !== rowIndex));
          alert("ลบข้อมูลสำเร็จ!");
        } else {
          const data = await response.json();
          alert("เกิดข้อผิดพลาด: " + (data.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error deleting score:", error);
        alert("เกิดข้อผิดพลาด");
      }
    }
  }

  async function handleSaveScore(score: Score) {
    try {
      if (editingScore) {
        // แก้ไขข้อมูล
        const response = await fetch("/api/form-scores", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(score),
        });

        if (response.ok) {
          setScores(
            scores.map((s) =>
              s.rowIndex === editingScore.rowIndex ? score : s
            )
          );
          alert("บันทึกข้อมูลสำเร็จ!");
        } else {
          const data = await response.json();
          alert("เกิดข้อผิดพลาด: " + (data.error || "Unknown error"));
        }
      } else {
        // เพิ่มข้อมูลใหม่
        const response = await fetch("/api/form-scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...score,
            userEmail,
          }),
        });

        if (response.ok) {
          fetchScores();
          alert("เพิ่มข้อมูลสำเร็จ!");
        } else {
          const data = await response.json();
          alert("เกิดข้อผิดพลาด: " + (data.error || "Unknown error"));
        }
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving score:", error);
      alert("เกิดข้อผิดพลาด");
    }
  }

  const dict = {
    title: {
      TH: "จัดการคะแนนกอล์ฟ",
      EN: "Manage Golf Scores",
      CN: "管理高尔夫分数",
    },
    addButton: { TH: "เพิ่มคะแนน", EN: "Add Score", CN: "添加分数" },
    location: { TH: "สนาม", EN: "Course", CN: "球场" },
    playerName: { TH: "ชื่อผู้เล่น", EN: "Player Name", CN: "球员姓名" },
    scores: {
      TH: "คะแนน (หลุม 1-18)",
      EN: "Scores (Holes 1-18)",
      CN: "分数 (1-18洞)",
    },
    actions: { TH: "จัดการ", EN: "Actions", CN: "操作" },
    edit: { TH: "แก้ไข", EN: "Edit", CN: "编辑" },
    delete: { TH: "ลบ", EN: "Delete", CN: "删除" },
  };

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
                    {dict.location[lang]}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    {dict.playerName[lang]}
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
                {scores.map((score) => (
                  <tr
                    key={score.rowIndex}
                    className="hover:bg-emerald-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {score.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {score.playerName}
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
                          onClick={() =>
                            handleDeleteScore(score.rowIndex!, score.playerName)
                          }
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
                คลิกปุ่ม "เพิ่มคะแนน" เพื่อเริ่มต้น
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
