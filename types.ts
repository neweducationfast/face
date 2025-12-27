export interface Student {
  id: string;
  name: string;
  course: string;
  photoUrl: string; // Base64 string of the reference photo
  registeredAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  timestamp: string;
  date: string; // YYYY-MM-DD for easy grouping
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  REGISTER = 'REGISTER',
  SCAN = 'SCAN',
  HISTORY = 'HISTORY'
}

export interface IdentificationResult {
  matchFound: boolean;
  studentId?: string;
  confidence?: string;
  message?: string;
}