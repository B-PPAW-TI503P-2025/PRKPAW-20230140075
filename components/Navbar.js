// Path: pawpraktikum1_react_20230140075/src/components/Navbar.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Token invalid");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
      <div className="font-bold text-lg">
        Sistem Presensi - {user.nama} ({user.role})
      </div>
      <div className="space-x-4 flex items-center">
        {/* Link Dashboard DIHAPUS */}
        <Link to="/presensi" className="hover:text-gray-200 font-semibold">Halaman Presensi</Link>
        
        <button     
          onClick={handleLogout} 
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm font-bold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;