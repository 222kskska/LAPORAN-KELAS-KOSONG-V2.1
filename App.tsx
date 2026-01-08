import React, { useState } from 'react';
import { ShieldCheck, GraduationCap, ChevronRight, School, Instagram, UserCircle } from 'lucide-react';
import StudentForm from './components/StudentForm';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import Login from './components/Login';
import { AdminUser, UserRole } from './types';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'HOME' | 'STUDENT' | 'PRE_AUTH_ADMIN' | 'PRE_AUTH_TEACHER' | 'ADMIN_DASHBOARD' | 'TEACHER_DASHBOARD'>('HOME');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Pastikan handleLogout, handleLoginSuccess selalu sesuai kontrak
  const handleLogout = () => {
    setCurrentUser(null);
    setViewState('HOME');
  };

  // Handle login success with role-based routing
  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    if (user.role === UserRole.TEACHER) {
      setViewState('TEACHER_DASHBOARD');
    } else {
      setViewState('ADMIN_DASHBOARD');
    }
  };

  // Footer
  const CreatorFooter: React.FC = () => (
    <div className="text-center mt-8">
      <p className="text-sm text-slate-600 mb-2">© 2025 SMP Negeri 4 Samarinda</p>
      <a 
        href="https://www.instagram.com/arifwbo/" 
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-pink-600 transition-colors group"
      >
        <span>Created by</span>
        <span className="font-bold group-hover:underline">ArifWbo</span>
        <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </a>
    </div>
  );

  // Tampilan HOME
  if (viewState === 'HOME') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 font-sans relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="w-full max-w-md z-10 animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
              <School className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3 tracking-tight">
              SiswaConnect
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
              Sistem Pelaporan Kegiatan Belajar Mengajar & Ketidakhadiran
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <School className="w-4 h-4" />
              <span className="font-medium">SMP Negeri 4 Samarinda</span>
            </div>
          </div>
          {/* Action Cards */}
          <div className="space-y-4 mb-6">
            {/* Student Access */}
            <button
              onClick={() => setViewState('STUDENT')}
              className="group w-full bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Akses Siswa
                    </h3>
                    <p className="text-sm text-slate-500">
                      Lapor kelas kosong atau guru tidak hadir
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
            {/* Admin Access */}
            <button
              onClick={() => setViewState('PRE_AUTH_ADMIN')}
              className="group w-full bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Akses Admin
                    </h3>
                    <p className="text-sm text-slate-500">
                      Guru Piket & Administrator
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
            {/* Teacher Access */}
            <button
              onClick={() => setViewState('PRE_AUTH_TEACHER')}
              className="group w-full bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <UserCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Akses Guru
                    </h3>
                    <p className="text-sm text-slate-500">
                      Form Izin & Penugasan Kelas
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
          <CreatorFooter />
        </div>
      </div>
    );
  }

  if (viewState === 'STUDENT') {
    // StudentForm harus menerima prop onBack sebagai function.
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <StudentForm onBack={() => setViewState('HOME')} />
      </div>
    );
  }

  if (viewState === 'PRE_AUTH_ADMIN') {
    // Login harus menerima onBack: () => void dan onLoginSuccess: (user: AdminUser) => void
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <Login 
          onBack={() => setViewState('HOME')} 
          onLoginSuccess={handleLoginSuccess}
          loginType="ADMIN"
        />
      </div>
    );
  }

  if (viewState === 'PRE_AUTH_TEACHER') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Login 
          onBack={() => setViewState('HOME')} 
          onLoginSuccess={handleLoginSuccess}
          loginType="TEACHER"
        />
      </div>
    );
  }

  if (viewState === 'ADMIN_DASHBOARD' && currentUser) {
    // AdminDashboard harus menerima user dan onLogout
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AdminDashboard 
          user={currentUser} 
          onLogout={handleLogout} 
        />
      </div>
    );
  }

  if (viewState === 'TEACHER_DASHBOARD' && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <TeacherDashboard 
          user={currentUser} 
          onLogout={handleLogout} 
        />
      </div>
    );
  }

  return null;
};

export default App;
