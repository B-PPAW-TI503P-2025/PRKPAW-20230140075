import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Sembunyikan navbar di halaman login/register
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <span className="text-xl font-bold text-gray-800">PresensiApp</span>
            </Link>
          </div>

          {token && (
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/presensi" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/presensi' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Presensi
              </Link>
              {/* Menu Laporan hanya untuk admin jika di backend 075 ada role validation */}
              <Link 
                to="/laporan" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/laporan' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Laporan
              </Link>
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;