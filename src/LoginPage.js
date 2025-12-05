// path: pawpraktikum1_react_20230140075/src/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(null); 

    try {
      // Pastikan URL backend sesuai (port 3001)
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: email,
        password: password
      });

      // Ambil token & role dari response
      const token = response.data.token;
      const role = response.data.role || 'mahasiswa'; 
      const user = response.data.user; // Opsional: jika backend mengirim data user

      // Simpan ke localStorage
      localStorage.setItem('token', token); 
      localStorage.setItem('role', role);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      // Redirect ke dashboard
      // Pastikan di App.js sudah ada route '/dashboard'
      navigate('/presensi');

    } catch (err) {
      console.error("Login Error:", err);
      // Menampilkan pesan error yang lebih informatif
      setError(err.response ? err.response.data.message : 'Login gagal. Cek koneksi server.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email:
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password:
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 text-center">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;