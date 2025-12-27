import React from 'react';
import { AttendanceRecord } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';
import { Calendar, Clock, User } from 'lucide-react';

interface AttendanceLogProps {
  records: AttendanceRecord[];
}

const AttendanceLog: React.FC<AttendanceLogProps> = ({ records }) => {
  // Calculate Stats
  const courseDistribution = records.reduce((acc, curr) => {
    acc[curr.course] = (acc[curr.course] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.keys(courseDistribution).map(key => ({
    name: key,
    value: courseDistribution[key]
  }));

  const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#10b981'];

  return (
    <div className="space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                    <User className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-slate-500 text-sm">Total Attendance</p>
                    <h3 className="text-3xl font-bold text-slate-900">{records.length}</h3>
                </div>
            </div>
            
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-2">
                <h3 className="text-slate-800 font-semibold mb-4">Course Distribution</h3>
                <div className="h-48 w-full flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <ReTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 text-sm ml-4">
                        {data.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                <span className="text-slate-600">{entry.name}: <b>{entry.value}</b></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Attendance Log - 2026</h3>
                <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                    Latest Records
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Student Name</th>
                            <th className="px-6 py-4 font-semibold">ID</th>
                            <th className="px-6 py-4 font-semibold">Course</th>
                            <th className="px-6 py-4 font-semibold text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {records.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                    No attendance records found yet.
                                </td>
                            </tr>
                        ) : (
                            records.slice().reverse().map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                                            {record.studentName.charAt(0)}
                                        </div>
                                        {record.studentName}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{record.studentId}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                            {record.course}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 text-sm">
                                        <div className="flex items-center justify-end gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(record.timestamp).toLocaleTimeString()}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {new Date(record.timestamp).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default AttendanceLog;