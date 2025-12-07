"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CourseModal from "@/components/CourseModal";

type Language = "TH" | "EN" | "CN";

interface Course {
  name: string;
  pars: number[];
}

export default function CourseSetupPage() {
  const [lang, setLang] = useState<Language>("TH");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      const response = await fetch("/api/courses");

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      setCourses(data.courses || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(err.message || "ไม่สามารถดึงข้อมูลสนามได้");
    } finally {
      setLoading(false);
    }
  }

  function handleAddCourse() {
    setEditingCourse(null);
    setIsModalOpen(true);
  }

  function handleEditCourse(course: Course) {
    setEditingCourse(course);
    setIsModalOpen(true);
  }

  async function handleDeleteCourse(name: string) {
    if (!confirm("คุณต้องการลบสนามนี้ใช่หรือไม่?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/courses?name=${encodeURIComponent(name)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ลบสนามไม่สำเร็จ");
      }

      fetchCourses();
      alert("ลบสนามสำเร็จ");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการลบสนาม");
    }
  }

  async function handleSaveCourse(course: Course) {
    try {
      if (editingCourse) {
        const response = await fetch("/api/courses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oldName: editingCourse.name,
            name: course.name,
            pars: course.pars,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "แก้ไขสนามไม่สำเร็จ");
        }

        alert("แก้ไขสนามสำเร็จ");
      } else {
        const response = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(course),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "เพิ่มสนามไม่สำเร็จ");
        }

        alert("เพิ่มสนามสำเร็จ");
      }

      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาด");
    }
  }

  const dict = {
    title: { TH: "รายการสนาม", EN: "Courses", CN: "球场列表" },
    addButton: { TH: "เพิ่มสนาม", EN: "Add Course", CN: "添加球场" },
    name: { TH: "จังหวัด", EN: "Province", CN: "省份" },
    par: {
      TH: "PAR (หลุม 1-18)",
      EN: "PAR (Holes 1-18)",
      CN: "标准杆 (1-18洞)",
    },
    actions: { TH: "จัดการ", EN: "Actions", CN: "操作" },
    edit: { TH: "แก้ไข", EN: "Edit", CN: "编辑" },
    delete: { TH: "ลบ", EN: "Delete", CN: "删除" },
    loading: { TH: "กำลังโหลด...", EN: "Loading...", CN: "加载中..." },
    noData: { TH: "ยังไม่มีข้อมูลสนาม", EN: "No courses yet", CN: "暂无球场" },
    clickToAdd: {
      TH: 'คลิกปุ่ม "เพิ่มสนาม" เพื่อเริ่มต้น',
      EN: 'Click "Add Course" to get started',
      CN: '点击"添加球场"开始',
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <Navbar currentLang={lang} onLanguageChange={setLang} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{dict.loading[lang]}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <Navbar currentLang={lang} onLanguageChange={setLang} />
        <div className="flex items-center justify-center h-96">
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
                onClick={() => fetchCourses()}
                className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700"
              >
                ลองอีกครั้ง
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar currentLang={lang} onLanguageChange={setLang} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            {dict.title[lang]}
          </h1>
          <button
            onClick={handleAddCourse}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span className="text-xl">+</span>
            {dict.addButton[lang]}
          </button>
        </div>

        {/* Courses List - Card Layout for Mobile */}
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Course Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">{course.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                  >
                    {dict.edit[lang]}
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.name)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                  >
                    {dict.delete[lang]}
                  </button>
                </div>
              </div>

              {/* PAR Display - Horizontal Grid */}
              <div className="p-4">
                <p className="text-sm text-gray-600 font-semibold mb-3">
                  {dict.par[lang]}
                </p>
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                  {course.pars.map((par, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center bg-emerald-50 rounded-lg p-2"
                    >
                      <span className="text-xs text-gray-500 font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-lg font-bold text-emerald-700">
                        {par}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total PAR */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                  <div className="bg-emerald-100 px-4 py-2 rounded-lg">
                    <span className="text-sm text-gray-600 font-medium">
                      Total PAR:{" "}
                    </span>
                    <span className="text-xl font-bold text-emerald-700">
                      {course.pars.reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-lg text-gray-600 font-semibold">
              {dict.noData[lang]}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {dict.clickToAdd[lang]}
            </p>
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <CourseModal
          course={editingCourse}
          onSave={handleSaveCourse}
          onClose={() => setIsModalOpen(false)}
          lang={lang}
        />
      )}
    </div>
  );
}
