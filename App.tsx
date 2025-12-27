import React, { useState, useCallback, useEffect } from 'react';
import { Student, AttendanceRecord, ViewState, IdentificationResult } from './types';
import StudentForm from './components/StudentForm';
import AttendanceLog from './components/AttendanceLog';
import Camera from './components/Camera';
import { identifyStudent } from './services/geminiService';
import { LayoutDashboard, UserPlus, ScanFace, History, School, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{status: 'success' | 'error' | 'idle' | 'loading', message: string}>({status: 'idle', message: ''});
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);

  // Load from local storage on mount (Mock persistence)
  useEffect(() => {
    const savedStudents = localStorage.getItem('facecheck_students');
    const savedAttendance = localStorage.getItem('facecheck_attendance');
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('facecheck_students', JSON.stringify(students));
    localStorage.setItem('facecheck_attendance', JSON.stringify(attendance));
  }, [students, attendance]);

  const handleRegisterStudent = (student: Student) => {
    setStudents([...students, student]);
    setView(ViewState.DASHBOARD);
    alert(`Successfully registered ${student.name}!`);
  };

  const handleMarkAttendance = useCallback(async (imageSrc: string) => {
    if (students.length === 0) {
      setScanResult({status: 'error', message: 'No students registered yet.'});
      return;
    }

    setScanResult({status: 'loading', message: 'Analyzing face...'});
    
    // Call AI Service
    const result: IdentificationResult = await identifyStudent(imageSrc, students);

    if (result.matchFound && result.studentId) {
      const student = students.find(s => s.id === result.studentId);
      if (student) {
        // Check if already marked today
        const today = new Date().toISOString().split('T')[0];
        const alreadyMarked = attendance.some(
            r => r.studentId === student.id && r.date === today
        );

        if (alreadyMarked) {
             setScanResult({status: 'error', message: `${student.name} already marked today.`});
        } else {
            const newRecord: AttendanceRecord = {
                id: crypto.randomUUID(),
                studentId: student.id,
                studentName: student.name,
                course: student.course,
                timestamp: new Date().toISOString(),
                date: today
            };
            setAttendance(prev => [...prev, newRecord]);
            setScanResult({status: 'success', message: `Welcome, ${student.name}! Attendance Marked.`});
        }
      } else {
        setScanResult({status: 'error', message: 'ID match found but student record missing.'});
      }
    } else {
      setScanResult({status: 'error', message: 'No matching face found.'});
    }
    
    // Clear status after 3 seconds
    setTimeout(() => {
        setScanResult(prev => prev.status === 'loading' ? prev : {status: 'idle', message: ''});
    }, 3000);
  }, [students, attendance]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col fixed md:sticky top-0 h-auto md:h-screen z-50">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-brand-500 p-2 rounded-lg">
                <ScanFace className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-lg font-bold tracking-tight">FaceCheck</h1>
                <span className="text-xs text-slate-400 font-mono">Ver. 2026.1</span>
            </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            <button 
                onClick={() => setView(ViewState.DASHBOARD)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === ViewState.DASHBOARD ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
            </button>
            <button 
                onClick={() => setView(ViewState.SCAN)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === ViewState.SCAN ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
                <ScanFace className="w-5 h-5" />
                Live Attendance
            </button>
            <button 
                onClick={() => setView(ViewState.REGISTER)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === ViewState.REGISTER ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
                <UserPlus className="w-5 h-5" />
                Registration
            </button>
            <button 
                onClick={() => setView(ViewState.HISTORY)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === ViewState.HISTORY ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
                <History className="w-5 h-5" />
                History Log
            </button>
        </nav>

        <div className="p-6 border-t border-slate-800">
            <div className="flex items-center gap-3 text-slate-400 text-sm">
                <School className="w-4 h-4" />
                <span>Academic Year 2026</span>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 p-4 md:p-8 ml-0 md:ml-0 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {view === ViewState.DASHBOARD && 'Dashboard Overview'}
                    {view === ViewState.REGISTER && 'Student Registration'}
                    {view === ViewState.SCAN && 'Live Face Attendance'}
                    {view === ViewState.HISTORY && 'Attendance Records'}
                </h2>
                <p className="text-slate-500 mt-1">Manage and track student attendance effortlessly.</p>
            </div>
            <div className="hidden md:block">
                <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-600">System Online</span>
                </div>
            </div>
        </header>

        {view === ViewState.DASHBOARD && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">+12%</span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">Total Students</h3>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{students.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Today</span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">Attendance Today</h3>
                        <p className="text-3xl font-bold text-slate-900 mt-1">
                            {attendance.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
                        </p>
                    </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/20 rounded-xl text-white">
                                <ScanFace className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-blue-100 text-sm font-medium">Quick Action</h3>
                        <button 
                            onClick={() => setView(ViewState.SCAN)}
                            className="mt-3 bg-white text-brand-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors"
                        >
                            Start Scanning
                        </button>
                    </div>
                </div>
                
                <AttendanceLog records={attendance} />
            </div>
        )}

        {view === ViewState.REGISTER && (
            <StudentForm 
                onRegister={handleRegisterStudent} 
                onCancel={() => setView(ViewState.DASHBOARD)} 
            />
        )}

        {view === ViewState.SCAN && (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                         <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-full ${scanning ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                 <ScanFace className="w-6 h-6" />
                             </div>
                             <div>
                                 <h3 className="font-bold text-slate-800">Scanner Active</h3>
                                 <p className="text-sm text-slate-500">
                                     {autoScanEnabled ? 'Auto-scanning every 5s...' : 'Manual scan mode'}
                                 </p>
                             </div>
                         </div>
                         <div className="flex gap-3">
                            <button
                                onClick={() => setAutoScanEnabled(!autoScanEnabled)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${autoScanEnabled ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {autoScanEnabled ? 'Stop Auto-Scan' : 'Enable Auto-Scan'}
                            </button>
                         </div>
                    </div>

                    <div className="relative rounded-xl overflow-hidden bg-black border-4 border-slate-900 shadow-2xl">
                        <Camera 
                            isActive={view === ViewState.SCAN} 
                            onCapture={handleMarkAttendance}
                            autoCaptureInterval={autoScanEnabled ? 5000 : 0} 
                        />
                        
                        {/* Status Overlay */}
                        {scanResult.status !== 'idle' && (
                            <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
                                <div className={`px-6 py-3 rounded-full shadow-lg backdrop-blur-md flex items-center gap-3 border ${
                                    scanResult.status === 'loading' ? 'bg-white/90 border-slate-200 text-slate-800' :
                                    scanResult.status === 'success' ? 'bg-green-500/90 border-green-400 text-white' :
                                    'bg-red-500/90 border-red-400 text-white'
                                }`}>
                                    {scanResult.status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {scanResult.status === 'success' && <ShieldCheck className="w-5 h-5" />}
                                    {scanResult.status === 'error' && <AlertCircle className="w-5 h-5" />}
                                    <span className="font-medium">{scanResult.message}</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Scanning Grid Overlay Effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://assets.codepen.io/13471/grid.png')] bg-center"></div>
                        <div className="absolute inset-0 pointer-events-none border-[30px] border-black/20"></div>
                    </div>

                    {!autoScanEnabled && (
                        <div className="mt-6 flex justify-center">
                            <button 
                                onClick={() => {
                                    // Trigger capture via a custom event or changing state handled in Camera?
                                    // Actually, we need to imperatively call capture. 
                                    // For simplicity in this structure, we toggle auto-scan briefly or rely on the Camera component ref approach which is cleaner but requires prop drilling ref.
                                    // Let's use the toggle for simplicity in UX, or ref if strictly needed.
                                    // Since Camera component handles internal logic, let's just use the auto-scan toggle for "Start"
                                    setAutoScanEnabled(true);
                                    setTimeout(() => setAutoScanEnabled(false), 5500); // Run for one cycle
                                }}
                                disabled={scanResult.status === 'loading'}
                                className="w-full md:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg hover:shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                <ScanFace className="w-5 h-5" />
                                Scan Now
                            </button>
                        </div>
                    )}
                    
                    <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg flex gap-3 border border-yellow-100">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>
                            <b>Note:</b> Ensure good lighting. The system uses AI to match the live camera feed with registered student photos. 
                            For this demo, please register at least one student first.
                        </p>
                    </div>
                </div>
            </div>
        )}

        {view === ViewState.HISTORY && (
            <AttendanceLog records={attendance} />
        )}

      </main>
    </div>
  );
};

export default App;