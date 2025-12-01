"use client";

import { useState, useEffect } from "react";

type Language = "TH" | "EN" | "CN";

interface Course {
  name: string;
  pars: number[];
}

interface CourseModalProps {
  course: Course | null;
  onSave: (course: Course) => void;
  onClose: () => void;
  lang: Language;
}

export default function CourseModal({
  course,
  onSave,
  onClose,
  lang,
}: CourseModalProps) {
  const [name, setName] = useState("");
  const [pars, setPars] = useState<(number | "")[]>(Array(18).fill(""));

  useEffect(() => {
    if (course) {
      setName(course.name);
      setPars(course.pars);
    } else {
      setName("");
      setPars(Array(18).fill(""));
    }
  }, [course]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // ตรวจสอบว่าทุกช่องกรอกแล้ว
    const hasEmptyPar = pars.some(
      (par) => par === "" || par === null || par === undefined
    );
    if (hasEmptyPar) {
      alert("กรุณากรอกค่า Par ให้ครบทุกหลุม (3-6)");
      return;
    }

    const newCourse: Course = {
      name,
      pars: pars.map((p) => (typeof p === "number" ? p : parseInt(String(p)))),
    };

    onSave(newCourse);
  }

  function updatePar(index: number, value: string) {
    const newPars = [...pars];
    newPars[index] = value === "" ? "" : parseInt(value);
    setPars(newPars);
  }

  const dict = {
    title: { TH: "ข้อมูลสนาม", EN: "Course Data", CN: "球场信息" },
    courseName: { TH: "ชื่อสนาม", EN: "Course Name", CN: "球场名称" },
    parValues: {
      TH: "ค่า Par ทั้ง 18 หลุม",
      EN: "Par Values (18 holes)",
      CN: "18洞标准杆",
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
          {/* ชื่อสนาม */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              {dict.courseName[lang]}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="กรุงเทพ, ชลบุรี, etc."
              required
            />
          </div>

          {/* ค่า Par */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">
              {dict.parValues[lang]}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {pars.map((par, idx) => (
                <div key={idx}>
                  <label className="block text-sm text-gray-600 mb-1">
                    Par {idx + 1}
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="6"
                    value={par}
                    onChange={(e) => updatePar(idx, e.target.value)}
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
