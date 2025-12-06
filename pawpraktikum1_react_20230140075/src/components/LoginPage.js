import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* BAGIAN KIRI - Dekoratif (Nuansa Ungu Elegan) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 relative overflow-hidden items-center justify-center">
        {/* Overlay Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        
        {/* Animated Blobs (Hiasan Ungu/Biru/Pink) */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-fuchsia-400/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl"></div>
        <div className="absolute top-[40%] left-[20%] w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 p-16 text-white max-w-xl">
          <div className="mb-8 inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
             <LogIn size={40} className="text-purple-200" />
          </div>
          <h1 className="text-5xl font-black mb-6 tracking-tight drop-shadow-lg leading-tight">
            Selamat Datang <br/>Kembali!
          </h1>
          <p className="text-lg text-purple-100/90 leading-relaxed font-medium">
            Sistem Presensi Terpadu. Kelola kehadiran dan kinerja Anda dengan lebih mudah, cepat, dan <span className="text-white font-bold decoration-fuchsia-400 underline decoration-2 underline-offset-4">terintegrasi</span>.
          </p>
        </div>
      </div>

      {/* BAGIAN KANAN - Form Login */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-slate-50">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(88,28,135,0.15)] border border-purple-50 relative">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-800">Masuk Akun</h2>
            <p className="text-slate-500 mt-3 font-medium">Masukkan email dan password Anda</p>
          </div>

          {/* Alert Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r animate-shake">
              <AlertCircle size={20} className="shrink-0" />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Input Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none font-medium text-slate-700"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none font-medium text-slate-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Masuk Sekarang <ArrowRight size={20} strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-purple-600 hover:text-indigo-600 hover:underline decoration-2 underline-offset-4 transition-colors">
              Daftar disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;