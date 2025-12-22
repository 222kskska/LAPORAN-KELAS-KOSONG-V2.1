import React, { useState } from 'react';
import { ShieldCheck, GraduationCap, ChevronRight, School, Instagram } from 'lucide-react';
import StudentForm from './components/StudentForm';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { UserRole, AdminUser } from './types';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'HOME' | 'STUDENT' | 'PRE_AUTH_ADMIN' | 'ADMIN_DASHBOARD'>('HOME');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const handleLogout = () => {
    setCurrentUser(null);
    setViewState('HOME');
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    setViewState('ADMIN_DASHBOARD');
  };

  const CreatorFooter = () => (
    <a 
      href="https://www.instagram.com/arifwbo/" 
      target="_blank" 
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-pink-600 transition-colors mt-2 group"
    >
      <span>Created by</span>
      <span className="font-bold group-hover:underline">ArifWbo</span>
      <Instagram className="w-3 h-3" />
    </a>
  );

  if (viewState === 'HOME') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6 font-sans relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>

        <div className="w-full max-w-lg z-10 animate-fade-in-up">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-float flex items-center justify-center mx-auto mb-6 transform rotate-3 transition-transform hover:rotate-6">
              <School className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
              Siswa<span className="text-primary">Connect</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-xs mx-auto leading-relaxed">
              Sistem Pelaporan Kegiatan Belajar Mengajar & Ketidakhadiran
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setViewState('STUDENT')}
              className="group w-full bg-white hover:bg-white p-5 rounded-2xl shadow-soft border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 h-full w-1.5 bg-primary transition-all group-hover:w-2"></div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="text-left ml-5 flex-1">
                <span className="block text-lg font-bold text-slate-800">
                  Akses Siswa
                </span>
                <span className="block text-sm text-slate-500 mt-0.5">
                  Lapor kelas kosong atau guru tidak hadir
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
            </button>

            <button
              onClick={() => setViewState('PRE_AUTH_ADMIN')}
              className="group w-full bg-white hover:bg-white p-5 rounded-2xl shadow-soft border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 h-full w-1.5 bg-slate-800 transition-all group-hover:w-2"></div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left ml-5 flex-1">
                <span className="block text-lg font-bold text-slate-800">
                  Akses Admin
                </span>
                <span className="block text-sm text-slate-500 mt-0.5">
                  Guru Piket & Administrator
                </span>
              </div>
               <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-800 transition-colors" />
            </button>
          </div>

          <div className="mt-12 text-center flex flex-col items-center">
            <p className="text-xs font-medium text-slate-400">
              &copy; 2025 SMP Negeri 4 Samarinda
            </p>
            <CreatorFooter />
          </div>
        </div>
      </div>
    );
  }

  if (viewState === 'PRE_AUTH_ADMIN') {
    return (
      <Login 
        onLoginSuccess={handleAdminLoginSuccess} 
        onBack={() => setViewState('HOME')} 
      />
    );
  }

  // Layout Wrapper for Inner Pages
  return (
    <div className="min-h-[100dvh] bg-slate-50 font-sans flex flex-col">
      {/* Student View has a simple navbar, Admin handles its own layout */}
      {viewState === 'STUDENT' && (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 w-full">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2" onClick={() => setViewState('HOME')}>
                <School className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg text-slate-800 tracking-tight cursor-pointer">
                  SiswaConnect
                </span>
              </div>
              <button
                onClick={() => setViewState('HOME')}
                className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                Batal
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className="flex-1 w-full h-full flex flex-col">
        {viewState === 'ADMIN_DASHBOARD' && currentUser ? (
          <AdminDashboard user={currentUser} onLogout={handleLogout} />
        ) : (
          <div className="max-w-md mx-auto w-full p-4 md:pt-8 pb-10 flex-1 flex flex-col">
             <StudentForm />
             <div className="mt-auto pt-8 text-center flex justify-center">
                <CreatorFooter />
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;