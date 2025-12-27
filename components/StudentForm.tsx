import React, { useState, useRef } from 'react';
import { Student } from '../types';
import Camera, { CameraHandle } from './Camera';
import { UserPlus, Camera as CameraIcon, Check, X } from 'lucide-react';

interface StudentFormProps {
  onRegister: (student: Student) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ onRegister, onCancel }) => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('Computer Science');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const cameraRef = useRef<CameraHandle>(null);

  const handleCapture = () => {
    if (cameraRef.current) {
      const img = cameraRef.current.capture();
      if (img) {
        setPhoto(img);
        setIsCameraActive(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) {
      alert("Please capture a student photo first.");
      return;
    }
    const newStudent: Student = {
      id: studentId,
      name,
      course,
      photoUrl: photo,
      registeredAt: new Date().toISOString()
    };
    onRegister(newStudent);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-3 bg-brand-50 rounded-full">
            <UserPlus className="w-6 h-6 text-brand-600" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800">New Registration</h2>
            <p className="text-sm text-slate-500">Academic Year 2026</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
                <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
                    placeholder="e.g. STU-2026-001"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
                    placeholder="e.g. Rahul Sharma"
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Course / Major</label>
            <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
            >
                <option value="Computer Science">B.Tech Computer Science</option>
                <option value="Data Science">B.Sc Data Science</option>
                <option value="Artificial Intelligence">B.Tech AI & ML</option>
                <option value="Electronics">Electronics Engineering</option>
                <option value="MBA">MBA - 2026 Batch</option>
            </select>
        </div>

        {/* Photo Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Face Registration</label>
          
          {!isCameraActive && !photo && (
            <div 
                onClick={() => setIsCameraActive(true)}
                className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-colors group"
            >
                <CameraIcon className="w-10 h-10 text-slate-400 group-hover:text-brand-500 mb-2" />
                <span className="text-slate-500 group-hover:text-brand-600 font-medium">Click to Open Camera</span>
            </div>
          )}

          {isCameraActive && (
            <div className="space-y-3">
                <Camera ref={cameraRef} isActive={true} />
                <button
                    type="button"
                    onClick={handleCapture}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                >
                    Capture Photo
                </button>
            </div>
          )}

          {photo && !isCameraActive && (
            <div className="relative w-48 mx-auto">
                <img src={photo} alt="Student" className="w-full h-48 object-cover rounded-xl shadow-md border-2 border-brand-500" />
                <button
                    type="button"
                    onClick={() => { setPhoto(null); setIsCameraActive(true); }}
                    className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-lg border border-slate-200 hover:bg-red-50 text-red-500"
                >
                    <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3" /> Photo OK
                </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
            <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="flex-1 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2"
            >
                <Check className="w-5 h-5" />
                Register Student
            </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;