import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icon leaflet yang hilang
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const AttendancePage = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusLokasi, setStatusLokasi] = useState("Mencari lokasi...");

  // Fungsi Mendapatkan Lokasi
  useEffect(() => {
    if (navigator.geolocation) {
      // Opsi akurasi tinggi (memaksa GPS jika tersedia)
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setStatusLokasi("Lokasi ditemukan ✅");
        },
        (error) => {
          console.warn("Error GPS:", error);
          setStatusLokasi("Gagal mendeteksi lokasi. Pastikan GPS aktif.");
          Swal.fire('Error', 'Gagal mendapatkan lokasi: ' + error.message, 'error');
        },
        options
      );
    } else {
      setStatusLokasi("Browser tidak mendukung Geolocation.");
    }
  }, []);

  const handlePresensi = async (type) => {
    if (!location) {
      Swal.fire('Peringatan', 'Tunggu sebentar, sedang mendeteksi lokasi Anda...', 'warning');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    
    const endpoint = type === 'masuk' 
      ? 'http://localhost:3001/api/presensi/check-in'
      : 'http://localhost:3001/api/presensi/check-out';

    try {
      await axios.post(endpoint, {
        latitude: location.lat,
        longitude: location.lng
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Presensi ${type === 'masuk' ? 'Masuk' : 'Pulang'} berhasil dicatat`,
        showConfirmButton: false,
        timer: 1500
      });
      
    } catch (error) {
      // Menangani error token expired atau tidak valid
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        Swal.fire('Sesi Habis', 'Silakan login ulang.', 'error');
        // Opsional: redirect ke login
        // window.location.href = '/login';
      } else {
        Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-blue-600 text-white text-center">
            <h1 className="text-2xl font-bold">Presensi Lokasi</h1>
            <p className="text-blue-100 mt-2 text-sm">{statusLokasi}</p>
          </div>

          <div className="p-6">
            {/* Bagian Peta */}
            <div className="h-80 w-full rounded-lg overflow-hidden border-2 border-gray-200 relative z-0 shadow-inner mb-6">
              {location ? (
                <MapContainer 
                  center={[location.lat, location.lng]} 
                  zoom={16} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[location.lat, location.lng]}>
                    <Popup>Posisi Anda Saat Ini</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 animate-pulse">
                   <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                   <span>Mendeteksi Satelit GPS...</span>
                </div>
              )}
            </div>
            
            {location && (
                <div className="text-center mb-6 bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-mono">
                        Koordinat: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                </div>
            )}

            {/* Tombol Aksi */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handlePresensi('masuk')}
                disabled={loading || !location}
                className={`py-4 px-6 rounded-lg font-bold text-white shadow transition transform active:scale-95 flex flex-col items-center justify-center gap-2 ${
                  loading || !location ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                <span className="text-2xl">📍</span>
                {loading ? 'Memproses...' : 'Check In (Masuk)'}
              </button>
              
              <button
                onClick={() => handlePresensi('keluar')}
                disabled={loading || !location}
                className={`py-4 px-6 rounded-lg font-bold text-white shadow transition transform active:scale-95 flex flex-col items-center justify-center gap-2 ${
                  loading || !location ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                <span className="text-2xl">🏠</span>
                {loading ? 'Memproses...' : 'Check Out (Pulang)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;