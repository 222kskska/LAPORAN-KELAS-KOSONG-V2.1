import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, School } from 'lucide-react';
import { apiService } from '../src/services/apiService';
import { AdminUser } from '../types';

interface LoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBack: () => void;
  loginType?: 'ADMIN' | 'TEACHER';
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack, loginType = 'ADMIN' }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Harap isi username dan password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await apiService.login(username, password);
      if (user) {
        // Validate role matches loginType
        if (loginType === 'TEACHER' && user.role !== 'TEACHER') {
          setError('Akses ini khusus untuk guru. Gunakan Akses Admin untuk role lainnya.');
          setLoading(false);
          return;
        }
        if (loginType === 'ADMIN' && user.role === 'TEACHER') {
          setError('Akses ini khusus untuk admin/operator. Gunakan Akses Guru untuk login sebagai guru.');
          setLoading(false);
          return;
        }
        onLoginSuccess(user);
      } else {
        setError('Username atau password salah');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4 relative overflow-hidden">
       {/* Background Decoration */}
       <div className={`absolute top-[-20%] left-[-10%] w-[500px] h-[500px] ${loginType === 'TEACHER' ? 'bg-green-500/5' : 'bg-primary/5'} rounded-full blur-[100px]`}></div>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-float overflow-hidden animate-fade-in relative z-10">
        
        {/* Header */}
        <div className="p-8 pb-0">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className={`${loginType === 'TEACHER' ? 'bg-green-500/10' : 'bg-primary/10'} p-2 rounded-xl`}>
               <School className={`w-6 h-6 ${loginType === 'TEACHER' ? 'text-green-600' : 'text-primary'}`} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Login {loginType === 'TEACHER' ? 'Guru' : 'Admin'}</h2>
          </div>
          <p className="text-slate-500 text-sm pl-1">
            {loginType === 'TEACHER' ? 'Masuk untuk mengajukan izin dan penugasan.' : 'Masuk untuk mengelola sistem sekolah.'}
          </p>
        </div>

        {/* Form */}
        <div className="p-8 pt-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="Masukkan username"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-3 border border-red-100 animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${loginType === 'TEACHER' ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30 hover:shadow-green-500/50' : 'bg-primary hover:bg-primary-dark shadow-primary/30 hover:shadow-primary/50'} text-white py-4 rounded-xl font-bold shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4`}
            >
              {loading ? 'Sedang Memproses...' : 'Masuk Dashboard'}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Kredensial Demo {loginType === 'TEACHER' ? 'Guru' : 'Admin'}: <span className="font-mono text-slate-600">{loginType === 'TEACHER' ? 'guru1 / password' : 'admin / password'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;