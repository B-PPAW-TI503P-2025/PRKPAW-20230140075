import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  LayoutDashboard, 
  User, 
  Calendar, 
  Activity, 
  X, 
  Menu,
  Briefcase,
  MapPin,
  Camera,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileText
} from 'lucide-react';

const AttendancePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // --- STATE ABSENSI ---
  const [lokasi, setLokasi] = useState({ lat: null, lng: null, error: null });
  const [fotoBlob, setFotoBlob] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  // State Status (Loading/Success/Error)
  const [statusAbsen, setStatusAbsen] = useState('idle'); // idle, loading, success, error
  const [pesanStatus, setPesanStatus] = useState('');

  // Refs untuk Kamera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // 1. Cek Token & User
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Ambil data user dari localStorage (Sesuai kode awal)
    const userString = localStorage.getItem("user");
    if (userString) {
      setUser(JSON.parse(userString));
    }

    // 2. Ambil Lokasi GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLokasi({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            error: null
          });
        },
        (err) => {
          console.error(err);
          setLokasi({ ...lokasi, error: "Gagal mendapatkan lokasi. Pastikan GPS aktif." });
        }
      );
    } else {
      setLokasi({ ...lokasi, error: "Browser tidak mendukung Geolocation." });
    }

    // 3. Nyalakan Kamera Otomatis
    startCamera();

    // Cleanup saat unmount
    return () => stopCamera();
  }, [navigate]);

  // --- LOGIKA KAMERA ---
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } // Kamera depan
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Gagal akses kamera:", err);
      setCameraActive(false);
      setPesanStatus("Izin kamera ditolak.");
      setStatusAbsen('error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Konversi ke Blob (untuk dikirim ke API)
      canvas.toBlob((blob) => {
        setFotoBlob(blob);
      }, 'image/jpeg', 0.8);

      // Konversi ke DataURL (untuk preview)
      const dataUrl = canvas.toDataURL('image/jpeg');
      setFotoPreview(dataUrl);
    }
  };

  const retakePhoto = () => {
    setFotoBlob(null);
    setFotoPreview(null);
    startCamera();
  };

  // --- LOGIKA API ABSEN (FITUR UTAMA) ---
  const handleAbsen = async (type) => {
    // Validasi Lokasi
    if (!lokasi.lat || !lokasi.lng) {
      setStatusAbsen('error');
      setPesanStatus("Lokasi belum ditemukan! Tunggu GPS terkunci.");
      return;
    }

    // Validasi Foto (Hanya Wajib untuk Check-IN)
    if (type === 'in' && !fotoBlob) {
      setStatusAbsen('error');
      setPesanStatus("Wajib ambil foto selfie untuk Check-In!");
      return;
    }

    setStatusAbsen('loading');
    setPesanStatus('Sedang mengirim data ke server...');

    try {
      const token = localStorage.getItem('token');
      let response;

      if (type === 'in') {
        // --- CHECK IN (Pakai FormData karena ada gambar) ---
        const formData = new FormData();
        formData.append('latitude', lokasi.lat);
        formData.append('longitude', lokasi.lng);
        formData.append('image', fotoBlob, `selfie-${Date.now()}.jpg`);

        response = await axios.post('http://localhost:3001/api/attendance/check-in', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // --- CHECK OUT (Biasanya JSON biasa, tanpa gambar) ---
        // Mengikuti logika kode awal Anda: Check-out tidak butuh foto
        response = await axios.post('http://localhost:3001/api/attendance/check-out', {
            latitude: lokasi.lat,
            longitude: lokasi.lng
        }, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
      }

      // SUKSES
      setStatusAbsen('success');
      setPesanStatus(type === 'in' ? 'Berhasil Check-IN! Selamat Bekerja.' : 'Berhasil Check-OUT! Hati-hati di jalan.');
      
      // Simpan status lokal (opsional, agar sinkron dengan dashboard lain)
      const today = new Date().toISOString().split('T')[0];
      const currentStatus = JSON.parse(localStorage.getItem("attendanceStatus") || "{}");
      localStorage.setItem("attendanceStatus", JSON.stringify({
          ...currentStatus,
          date: today,
          hasCheckedIn: type === 'in' ? true : currentStatus.hasCheckedIn,
          hasCheckedOut: type === 'out' ? true : currentStatus.hasCheckedOut
      }));

      // Reset Foto setelah sukses check-in
      if(type === 'in') {
        setFotoBlob(null);
        setFotoPreview(null);
        startCamera(); 
      }

    } catch (error) {
      console.error(error);
      setStatusAbsen('error');
      setPesanStatus(error.response?.data?.message || 'Gagal melakukan presensi.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('attendanceStatus');
    navigate('/login');
  };

  // Komponen Helper Navigasi
  const NavItem = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-indigo-800 text-white shadow-md shadow-indigo-900/20 border border-indigo-700' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}>
      {icon} <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-950 to-purple-900 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shadow-2xl`}>
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-2 rounded-lg">
                <Briefcase className="w-6 h-6 text-fuchsia-400" />
            </div>
            <h1 className="text-xl font-black tracking-wider">PRESENSI<span className="text-fuchsia-400">APP</span></h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-indigo-300 hover:text-white"><X size={24} /></button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => navigate('/dashboard')} />
          <NavItem icon={<Calendar size={20} />} label="Presensi Harian" active />
          
          {/* Menu Admin Only */}
          {user && user.role === 'admin' && (
             <NavItem icon={<FileText size={20} />} label="Laporan Pegawai" onClick={() => navigate('/report')} />
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-6 bg-black/20 backdrop-blur-sm border-t border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-lg font-bold shadow-lg">
                {user?.nama?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.nama || "User"}</p>
                <p className="text-xs text-indigo-300 truncate capitalize">{user?.role || "Pegawai"}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 text-red-200 hover:text-white py-2.5 rounded-xl transition-all font-semibold text-sm border border-red-500/20 hover:border-red-500">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        
        {/* Header Mobile */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-800">Presensi</h2>
          <button onClick={() => setIsSidebarOpen(true)} className="text-indigo-600 bg-indigo-50 p-2 rounded-lg"><Menu size={24} /></button>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header Card Gradient */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-black tracking-tight">Form Absensi</h2>
              <p className="opacity-90 mt-2 font-medium text-indigo-100 max-w-lg">Pastikan GPS aktif dan wajah terlihat jelas saat mengambil foto untuk validasi kehadiran.</p>
              
              <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md border border-white/20 shadow-sm">
                <MapPin size={16} className="text-fuchsia-300" /> 
                {lokasi.error ? (
                    <span className="text-red-200">{lokasi.error}</span>
                ) : (lokasi.lat ? (
                    <span>Lokasi Terkunci: {lokasi.lat.toFixed(4)}, {lokasi.lng.toFixed(4)}</span>
                ) : (
                    <span className="animate-pulse">Mencari titik GPS...</span>
                ))}
              </div>
            </div>
            {/* Dekorasi Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="absolute bottom-0 left-20 w-40 h-40 bg-indigo-900/20 rounded-full blur-2xl"></div>
          </div>

          {/* Alert Status Message */}
          {statusAbsen !== 'idle' && (
            <div className={`p-5 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-300 border-l-4 shadow-sm ${
                statusAbsen === 'success' ? 'bg-green-50 text-green-800 border-green-500' : 
                statusAbsen === 'error' ? 'bg-red-50 text-red-800 border-red-500' : 
                'bg-blue-50 text-blue-800 border-blue-500'
            }`}>
              <div className={`p-2 rounded-full ${statusAbsen === 'success' ? 'bg-green-200' : statusAbsen === 'error' ? 'bg-red-200' : 'bg-blue-200'}`}>
                {statusAbsen === 'success' ? <CheckCircle size={20} /> : statusAbsen === 'error' ? <AlertTriangle size={20} /> : <RefreshCw size={20} className="animate-spin" />}
              </div>
              <span className="font-bold">{pesanStatus}</span>
            </div>
          )}

          {/* Grid Layout: Kamera & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* KOLOM KIRI: KAMERA */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl shadow-[0_5px_30px_-5px_rgba(0,0,0,0.05)] border border-slate-100">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Camera size={20} className="text-indigo-500" /> Ambil Foto Selfie</h3>
                
                <div className="aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden relative shadow-inner ring-1 ring-black/5">
                  {!fotoPreview ? (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                  ) : (
                    <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  {/* Canvas Tersembunyi */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="mt-5 flex gap-3">
                  {!fotoPreview ? (
                    <button onClick={takePhoto} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all">
                        <Camera size={20} /> AMBIL FOTO
                    </button>
                  ) : (
                    <button onClick={retakePhoto} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                        <RefreshCw size={18} /> FOTO ULANG
                    </button>
                  )}
                </div>
              </div>

              {/* TOMBOL ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => handleAbsen('in')} 
                    disabled={statusAbsen === 'loading' || !fotoBlob} 
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black shadow-lg shadow-green-200 flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all group"
                >
                    <div className="bg-white/20 p-2 rounded-full mb-1 group-hover:scale-110 transition-transform"><Clock size={24} /></div>
                    <span>CHECK IN</span>
                </button>
                
                <button 
                    onClick={() => handleAbsen('out')} 
                    disabled={statusAbsen === 'loading'} 
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black shadow-lg shadow-red-200 flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all group"
                >
                    <div className="bg-white/20 p-2 rounded-full mb-1 group-hover:scale-110 transition-transform"><LogOut size={24} /></div>
                    <span>CHECK OUT</span>
                </button>
              </div>
            </div>

            {/* KOLOM KANAN: PETA */}
            <div className="bg-white p-5 rounded-3xl shadow-[0_5px_30px_-5px_rgba(0,0,0,0.05)] border border-slate-100 h-fit">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><MapPin size={20} className="text-fuchsia-500" /> Posisi Anda</h3>
              
              <div className="aspect-square w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                {lokasi.lat ? (
                  // IFRAME OPENSTREETMAP (Sesuai request Layout Code 2)
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${lokasi.lng-0.002},${lokasi.lat-0.002},${lokasi.lng+0.002},${lokasi.lat+0.002}&layer=mapnik&marker=${lokasi.lat},${lokasi.lng}`} 
                    className="absolute inset-0 grayscale-[20%]"
                    title="User Location"
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 flex-col animate-pulse">
                    <MapPin size={40} className="text-slate-300 mb-2" />
                    <span className="text-sm font-semibold">Sedang mencari sinyal GPS...</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                *Peta ini hanya referensi visual. Koordinat akurat tetap dikirim via sistem.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendancePage;