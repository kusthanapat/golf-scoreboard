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

  // ดึงข้อมูลสนามจาก Google Sheets หรือ Local Storage
  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    // TODO: ดึงข้อมูลจาก API
    // ตัวอย่างข้อมูล mock
    const mockCourses: Course[] = [
      {
        name: "กรุงเทพ",
        pars: [4, 3, 5, 4, 6, 4, 5, 4, 5, 3, 6, 4, 5, 5, 4, 3, 5, 5],
      },
      {
        name: "ชลบุรี",
        pars: [5, 3, 4, 5, 5, 4, 3, 5, 5, 4, 4, 3, 5, 5, 3, 4, 5, 5],
      },
    ];
    setCourses(mockCourses);
  }

  function handleAddCourse() {
    setEditingCourse(null);
    setIsModalOpen(true);
  }

  function handleEditCourse(course: Course) {
    setEditingCourse(course);
    setIsModalOpen(true);
  }

  function handleDeleteCourse(name: string) {
    if (confirm("คุณต้องการลบสนามนี้ใช่หรือไม่?")) {
      setCourses(courses.filter((c) => c.name !== name));
      // TODO: ลบจาก Google Sheets
    }
  }

  function handleSaveCourse(course: Course) {
    if (editingCourse) {
      // แก้ไข
      setCourses(
        courses.map((c) => (c.name === editingCourse.name ? course : c))
      );
    } else {
      // เพิ่มใหม่
      setCourses([...courses, course]);
    }
    setIsModalOpen(false);
    // TODO: บันทึกไปยัง Google Sheets
  }

  const dict = {
    title: { TH: "รายการสนาม", EN: "Courses", CN: "球场列表" },
    addButton: { TH: "เพิ่มสนาม", EN: "Add Course", CN: "添加球场" },
    name: { TH: "ชื่อสนาม", EN: "Course Name", CN: "球场名称" },
    par: {
      TH: "PAR (หลุม 1-18)",
      EN: "PAR (Holes 1-18)",
      CN: "标准杆 (1-18洞)",
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
            onClick={handleAddCourse}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-all"
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
                    {dict.name[lang]}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    {dict.par[lang]}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    {dict.actions[lang]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courses.map((course, index) => (
                  <tr
                    key={index}
                    className="hover:bg-emerald-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {course.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {course.pars.map((par, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold"
                          >
                            {par}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          {dict.edit[lang]}
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.name)}
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

          {courses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">ยังไม่มีข้อมูลสนาม</p>
              <p className="text-sm mt-2">คลิกปุ่ม "เพิ่มสนาม" เพื่อเริ่มต้น</p>
            </div>
          )}
        </div>
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
