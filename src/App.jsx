import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Moon, Sun, Clock, Search, Filter, 
  FileText, Download, CheckCircle2, AlertCircle, X,
  ChevronRight, FileDown, BookOpen, Lock, Users, Activity,
  Briefcase, Gavel, Scale, Plus, Edit, Trash2, Upload, Eye, EyeOff,
  LogOut, ArrowUpDown, ListOrdered, BarChart3, History, User, Settings, Pin,
  Smartphone, Monitor, UserCheck, CalendarDays, Package, Ticket, Building, Camera, Image as ImageIcon,
  Printer, Table
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

// ==========================================
// FIREBASE SETUP
// ==========================================
const CUSTOM_FIREBASE_CONFIG = {
  // Masukkan konfigurasi Firebase Anda di sini jika diperlukan
  apiKey: "AIzaSyC_gCm3FLUMjHnFFIHzBdiZTgesYjEQLP8",
  authDomain: "sikut-3a7c3.firebaseapp.com",
  projectId: "sikut-3a7c3",
  storageBucket: "sikut-3a7c3.firebasestorage.app",
  messagingSenderId: "375107747048",
  appId: "1:375107747048:web:8d3f226515eff4676c5d5d"
};

let app, auth, db, appId = 'default-app-id';
try {
  const firebaseConfig = CUSTOM_FIREBASE_CONFIG.apiKey 
    ? CUSTOM_FIREBASE_CONFIG 
    : JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
    
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
} catch (err) {
  console.warn("Firebase not configured in environment.", err);
}

// ==========================================
// MOCK DATA: DAFTAR KUNJUNGAN TAMU
// ==========================================
const MOCK_VISIT_DATA = [
  {
    id: "VIS-2404-001",
    visitorName: "Budi Santoso",
    institutionName: "Polres Alor",
    status: "Terdaftar",
    date: "2024-04-30",
    time: "09:00",
    purpose: "Koordinasi pengamanan rutin",
    updatedBy: "Sistem",
    isPinned: true,
    photoUrl: null,
    history: [
      { version: "1.0", date: "2024-04-28", updatedBy: "Pengunjung", description: "Pendaftaran kunjungan secara online." }
    ]
  },
  {
    id: "VIS-2404-002",
    visitorName: "Siti Aminah",
    institutionName: "Dinas Kesehatan Daerah",
    status: "Terdaftar",
    date: new Date().toISOString().split('T')[0],
    time: "10:30",
    purpose: "Pemeriksaan sanitasi dapur Lapas",
    updatedBy: "Sistem",
    photoUrl: null,
    history: []
  },
  {
    id: "VIS-2404-003",
    visitorName: "Lukman Hakim, SH",
    institutionName: "Kejaksaan Negeri",
    status: "Terdaftar",
    date: new Date().toISOString().split('T')[0],
    time: "13:00",
    purpose: "Koordinasi pelimpahan berkas perkara tahanan",
    updatedBy: "Petugas Registrasi",
    photoUrl: null,
    history: []
  }
];

// ==========================================
// FUNGSI HELPER GLOBAL
// ==========================================
const formatLiveTime = (date) => {
  const optionsDate = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  return `${new Intl.DateTimeFormat('id-ID', optionsDate).format(date)} - ${new Intl.DateTimeFormat('id-ID', optionsTime).format(date)} WITA`;
};

const formatDateIndo = (dateStr) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(dateStr));
};

const getStatusBadgeClass = () => {
  return 'bg-blue-500 text-white shadow-blue-500/30';
};

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') !== 'false');
  const [isMobileView, setIsMobileView] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState(null);
  
  // State Data Kunjungan
  const [visits, setVisits] = useState(MOCK_VISIT_DATA);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [fbUser, setFbUser] = useState(null);

  // State Manajemen Admin (Auth)
  const [adminUser, setAdminUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const isAdmin = adminUser !== null;

  // State Pengaturan Akun
  const [adminCreds, setAdminCreds] = useState(() => {
    const saved = localStorage.getItem('sikutAdminCreds');
    return saved ? JSON.parse(saved) : { username: 'admin', password: 'password' };
  });
  
  const [superAdminCreds, setSuperAdminCreds] = useState(() => {
    const saved = localStorage.getItem('sikutSuperAdminCreds');
    return saved ? JSON.parse(saved) : { username: 'lpkalabahi', password: 'pastiwbk123' };
  });

  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState(() => {
    const saved = localStorage.getItem('sikutAutoLogout');
    return saved ? parseInt(saved) : 30; // default 30 menit
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ 
    ...adminCreds, 
    superUsername: superAdminCreds.username,
    superPassword: superAdminCreds.password,
    autoLogoutMinutes 
  });
  const [loginError, setLoginError] = useState('');

  // State Form Kunjungan
  const [showVisitForm, setShowVisitForm] = useState(false); // Modal untuk admin edit
  const [editingVisit, setEditingVisit] = useState(null);
  
  const resetForm = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, -1);
    
    setFormData({
      visitorName: '', institutionName: '', 
      status: 'Terdaftar', 
      date: localISOTime.split('T')[0], 
      time: localISOTime.split('T')[1].substring(0, 5), 
      purpose: ''
    });
  };

  const [formData, setFormData] = useState({
    visitorName: '', institutionName: '', 
    status: 'Terdaftar', 
    date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0], 
    time: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[1].substring(0, 5), 
    purpose: ''
  });

  // State Modal Konfirmasi Custom
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const [promptDialog, setPromptDialog] = useState({ isOpen: false, message: '', value: '', onConfirm: null });

  // State Filtering, Sorting, Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTime, setSelectedTime] = useState('Semua Waktu');
  const [sortBy, setSortBy] = useState('Terbaru');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // FIREBASE AUTH & FETCH DATA
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { console.error("Firebase Auth Error:", e); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setFbUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!fbUser || !db) return;
    const visitsRef = collection(db, 'artifacts', appId, 'public', 'data', 'visits');
    const unsubscribe = onSnapshot(visitsRef, (snapshot) => {
      const fetchedVisits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (fetchedVisits.length > 0) {
        setVisits(fetchedVisits);
      } else {
        // First time setup
        MOCK_VISIT_DATA.forEach(mockVisit => {
          setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'visits', mockVisit.id), mockVisit);
        });
      }
    }, (error) => console.error("Firestore Error:", error));
    return () => unsubscribe();
  }, [fbUser]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  // Efek Jam Live
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Efek Auto Logout (Inaktivitas)
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      if (adminUser) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setAdminUser(null);
          showToast("Sesi habis. Anda telah otomatis logout karena tidak ada aktivitas.", "error");
        }, autoLogoutMinutes * 60000);
      }
    };

    if (adminUser) {
      resetTimer(); // Mulai timer saat login
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keypress', resetTimer);
      window.addEventListener('click', resetTimer);
      window.addEventListener('scroll', resetTimer);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [adminUser, autoLogoutMinutes]);

  // Reset Halaman ke-1 setiap kali filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTime, sortBy, itemsPerPage]);

  // Filter Waktu (Digunakan untuk Dashboard & Tabel Admin)
  const timeFilteredVisits = useMemo(() => {
    if (selectedTime === 'Semua Waktu') return visits;
    return visits.filter(visit => {
      let matchTime = true;
      const visitDate = new Date(visit.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      visitDate.setHours(0, 0, 0, 0);
      
      if (selectedTime === 'Hari Ini') {
        matchTime = visitDate.getTime() === today.getTime();
      } else if (selectedTime === 'Kemarin') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        matchTime = visitDate.getTime() === yesterday.getTime();
      } else if (selectedTime === '7 Hari Terakhir') {
        const diffTime = today.getTime() - visitDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
        matchTime = diffDays >= 0 && diffDays <= 7;
      } else if (selectedTime === '30 Hari Terakhir') {
        const diffTime = today.getTime() - visitDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
        matchTime = diffDays >= 0 && diffDays <= 30;
      } else if (selectedTime === 'Bulan Ini') {
        matchTime = visitDate.getMonth() === today.getMonth() && visitDate.getFullYear() === today.getFullYear();
      } else if (selectedTime === 'Bulan Lalu') {
        let lastMonth = today.getMonth() - 1;
        let year = today.getFullYear();
        if (lastMonth < 0) {
          lastMonth = 11;
          year -= 1;
        }
        matchTime = visitDate.getMonth() === lastMonth && visitDate.getFullYear() === year;
      } else if (selectedTime === 'Tahun Ini') {
        matchTime = visitDate.getFullYear() === today.getFullYear();
      } else if (selectedTime.startsWith('custom:')) {
        const customDateStr = selectedTime.replace('custom:', '');
        if (customDateStr) {
          matchTime = visit.date === customDateStr;
        } else {
          matchTime = true; // Tampilkan semua sampai tanggal spesifik dipilih
        }
      }
      return matchTime;
    });
  }, [visits, selectedTime]);

  // Filter & Sort Logika
  const filteredAndSortedVisits = useMemo(() => {
    // 1. Filter
    let result = timeFilteredVisits.filter(visit => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = visit.visitorName.toLowerCase().includes(searchLower) || 
                          visit.institutionName.toLowerCase().includes(searchLower) ||
                          visit.id.toLowerCase().includes(searchLower);
      return matchSearch;
    });

    // 2. Sort
    switch(sortBy) {
      case 'Terlama':
        result.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        break;
      case 'A-Z (Pengunjung)':
        result.sort((a, b) => a.visitorName.localeCompare(b.visitorName));
        break;
      case 'Z-A (Pengunjung)':
        result.sort((a, b) => b.visitorName.localeCompare(a.visitorName));
        break;
      case 'Terbaru':
      default:
        result.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
        break;
    }

    // 3. Pin Sort (Pinned always on top)
    result.sort((a, b) => (b.isPinned === true ? 1 : 0) - (a.isPinned === true ? 1 : 0));

    return result;
  }, [searchTerm, sortBy, timeFilteredVisits]);

  // Pagination Logika
  const totalPages = Math.ceil(filteredAndSortedVisits.length / itemsPerPage);
  const paginatedVisits = filteredAndSortedVisits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Fungsi Autentikasi
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    if (loginCreds.username === superAdminCreds.username && loginCreds.password === superAdminCreds.password) {
      setAdminUser({ username: 'Super Admin', role: 'superadmin' });
      setShowLoginModal(false);
      setLoginCreds({ username: '', password: '' });
      showToast('Berhasil Login sebagai Super Admin!');
    } else if (loginCreds.username === adminCreds.username && loginCreds.password === adminCreds.password) {
      setAdminUser({ username: 'Petugas P2U', role: 'admin' });
      setShowLoginModal(false);
      setLoginCreds({ username: '', password: '' });
      showToast('Berhasil Login sebagai Petugas!');
    } else {
      setLoginError('Username atau Password tidak valid!');
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleTogglePin = async (id, e) => {
    e.stopPropagation();
    const visit = visits.find(v => v.id === id);
    if (!visit) return;
    
    if (db && fbUser) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'visits', id), { ...visit, isPinned: !visit.isPinned }, { merge: true });
    } else {
      setVisits(prev => prev.map(v => v.id === id ? { ...v, isPinned: !v.isPinned } : v));
    }
    showToast(visit.isPinned ? "Kunjungan dilepas dari sematan." : "Kunjungan disematkan ke atas!");
  };

  // Handler Simpan / Edit (Versioning & Audit Trail)
  const handleSaveVisit = async (e) => {
    e.preventDefault();
    if (editingVisit) {
      // Simpan Perubahan (Hanya diedit oleh admin)
      const newHistoryEntry = {
        version: `v${(editingVisit.history?.length || 0) + 1}.0`,
        date: new Date().toISOString().split('T')[0],
        updatedBy: adminUser ? adminUser.username : 'Sistem',
        description: `Data kunjungan diperbarui.`
      };

      const updatedHistory = [newHistoryEntry, ...(editingVisit.history || [])];

      const updatedVisit = {
        ...editingVisit,
        ...formData,
        updatedBy: adminUser ? adminUser.username : 'Pengunjung',
        history: updatedHistory
      };

      if (db && fbUser) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'visits', updatedVisit.id), updatedVisit);
      } else {
        setVisits(visits.map(v => v.id === editingVisit.id ? updatedVisit : v));
      }
      showToast("Data Kunjungan berhasil diperbarui!");
      setShowVisitForm(false);
    } else {
      // Pendaftaran Kunjungan Baru (Otomatis ambil waktu saat ini)
      const now = new Date();
      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, -1);
      const exactDate = localISOTime.split('T')[0];
      const exactTime = localISOTime.split('T')[1].substring(0, 5);

      const dateCode = exactDate.replace(/-/g, '').substring(2,8);
      const newId = `VIS-${dateCode}-${Math.floor(Math.random()*1000).toString().padStart(3, '0')}`;
      const newVisit = { 
        ...formData, 
        date: exactDate,
        time: exactTime,
        id: newId, 
        status: 'Terdaftar', // Paksa status default
        updatedBy: adminUser ? adminUser.username : 'Sistem Pendaftaran',
        history: [
          { 
            version: "1.0", 
            date: new Date().toISOString().split('T')[0], 
            updatedBy: adminUser ? adminUser.username : 'Pengunjung', 
            description: `Pendaftaran kunjungan instansi baru.` 
          }
        ],
        isPinned: false
      };

      if (db && fbUser) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'visits', newId), newVisit);
      } else {
        setVisits([newVisit, ...visits]);
      }
      showToast("Pendaftaran Kunjungan Baru berhasil! Data telah masuk ke sistem kami.");
      
      if (isAdmin) {
        setShowVisitForm(false);
      } else {
        resetForm(); // Bersihkan form untuk pendaftar publik
      }
    }
  };

  const handleDeleteVisit = (id, e) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      message: "Apakah Anda yakin ingin membatalkan/menghapus data kunjungan ini secara permanen?",
      onConfirm: async () => {
        if (db && fbUser) {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'visits', id));
        } else {
          setVisits(prev => prev.filter(v => v.id !== id));
        }
        showToast("Data kunjungan berhasil dihapus!");
      }
    });
  };

  // ==========================================
  // FUNGSI EKSPORT & CETAK LAPORAN (ADMIN)
  // ==========================================
  const generateTableHtml = () => {
    let html = '<table border="1" style="border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 12px;"><thead><tr style="background-color: #f0f0f0;">';
    html += '<th style="padding: 8px;">ID Kunjungan</th><th style="padding: 8px;">Tanggal</th><th style="padding: 8px;">Waktu</th><th style="padding: 8px;">Nama Lengkap</th><th style="padding: 8px;">Asal/Instansi</th><th style="padding: 8px;">Tujuan</th>';
    html += '</tr></thead><tbody>';
    filteredAndSortedVisits.forEach(v => {
      html += `<tr><td style="padding: 8px;">${v.id}</td><td style="padding: 8px;">${v.date}</td><td style="padding: 8px;">${v.time}</td><td style="padding: 8px;">${v.visitorName}</td><td style="padding: 8px;">${v.institutionName}</td><td style="padding: 8px;">${v.purpose || '-'}</td></tr>`;
    });
    html += '</tbody></table>';
    return html;
  };

  const handleExportExcel = () => {
    const html = generateTableHtml();
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_SIKUT_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Laporan Excel berhasil diunduh!");
  };

  const handleExportWord = () => {
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Laporan Kunjungan</title></head>
      <body>
        <h2 style="text-align: center; font-family: sans-serif;">LAPORAN KUNJUNGAN TAMU INSTANSI - SIKUT</h2>
        <p style="text-align: center; font-family: sans-serif;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        <br/>
        ${generateTableHtml()}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_SIKUT_${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Laporan Word berhasil diunduh!");
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '', 'width=900,height=650');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Laporan Kunjungan</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; margin-bottom: 5px; text-transform: uppercase; }
            p { text-align: center; font-size: 14px; margin-top: 0; color: #666; margin-bottom: 20px;}
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            @media print {
              @page { size: landscape; margin: 15mm; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h2>LAPORAN KUNJUNGAN TAMU INSTANSI</h2>
          <p>Sistem Kunjungan Tamu (SIKUT) - Lapas Kelas IIB Kalabahi<br/><span style="font-size: 11px;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</span></p>
          ${generateTableHtml()}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b1120] text-slate-950 dark:text-slate-100 transition-colors duration-500 font-sans selection:bg-blue-900/30 overflow-x-hidden relative flex justify-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;600;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        button, select, label[for], input[type="checkbox"], input[type="file"] { 
          cursor: pointer !important; 
        }
        
        .glass-card { 
          background: rgba(255, 255, 255, 0.65); 
          backdrop-filter: blur(24px); 
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(148, 163, 184, 0.4); 
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02) inset; 
        }
        .dark .glass-card { 
          background: rgba(15, 23, 42, 0.5); 
          border: 1px solid rgba(255, 255, 255, 0.08); 
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset; 
        }
        
        .btn-3d { 
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          box-shadow: 0 6px 0 rgba(30, 58, 138, 0.6), 0 15px 20px rgba(30, 58, 138, 0.3); 
        }
        .btn-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 0 rgba(30, 58, 138, 0.6), 0 20px 25px rgba(30, 58, 138, 0.4);
        }
        .btn-3d:active { 
          transform: translateY(4px); 
          box-shadow: 0 2px 0 rgba(30, 58, 138, 0.6), 0 5px 10px rgba(30, 58, 138, 0.2); 
        }
        
        .btn-3d-gold { 
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          box-shadow: 0 6px 0 rgba(245, 158, 11, 0.6), 0 15px 20px rgba(245, 158, 11, 0.3); 
        }
        .btn-3d-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 0 rgba(245, 158, 11, 0.6), 0 20px 25px rgba(245, 158, 11, 0.4);
        }
        .btn-3d-gold:active { 
          transform: translateY(4px); 
          box-shadow: 0 2px 0 rgba(245, 158, 11, 0.6), 0 5px 10px rgba(245, 158, 11, 0.2); 
        }

        .premium-input {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.6);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .dark .premium-input {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(51, 65, 85, 0.5);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .premium-input:focus {
          border-color: #1e3a8a;
          box-shadow: 0 0 0 4px rgba(30, 58, 138, 0.15), inset 0 2px 4px rgba(0,0,0,0.02);
          background: #ffffff;
        }
        .dark .premium-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.15), inset 0 2px 4px rgba(0,0,0,0.2);
          background: #0f172a;
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark ::-webkit-scrollbar-thumb { background: #334155; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark ::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

      {/* DYNAMIC BACKGROUND BLOBS */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-blue-900/20 dark:bg-blue-600/10 rounded-full blur-[100px] -z-10 animate-pulse pointer-events-none mix-blend-multiply dark:mix-blend-lighten" style={{animationDuration: '8s'}}></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-amber-500/20 dark:bg-amber-600/10 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none mix-blend-multiply dark:mix-blend-lighten" style={{animationDuration: '10s'}}></div>
      <div className="fixed top-[40%] left-[60%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-blue-800/10 dark:bg-blue-600/10 rounded-full blur-[80px] -z-10 animate-pulse pointer-events-none mix-blend-multiply dark:mix-blend-lighten" style={{animationDuration: '12s'}}></div>

      {/* GLOBAL TOAST */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300 backdrop-blur-md border ${toast.type === 'error' ? 'bg-rose-600/90 border-rose-500 text-white' : 'bg-emerald-600/90 border-emerald-500 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle size={22}/> : <CheckCircle2 size={22}/>}
          <span className="text-xs font-bold uppercase tracking-widest text-white">{toast.message}</span>
        </div>
      )}

      {/* HEADER GLOBAL */}
      <header className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 px-6 py-4 flex justify-between items-center pointer-events-none transition-all duration-500 w-full ${isMobileView ? 'max-w-[480px]' : 'max-w-full'}`}>
        <div className="glass-card px-5 py-3 rounded-2xl pointer-events-auto flex items-center gap-3 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-1">
            {adminUser?.role === 'superadmin' && (
              <button onClick={() => { 
                setSettingsForm({ 
                  ...adminCreds, 
                  superUsername: superAdminCreds.username, 
                  superPassword: superAdminCreds.password, 
                  autoLogoutMinutes 
                }); 
                setShowSettings(true); 
              }} className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 transition-all" title="Pengaturan Sistem">
                <Settings className="text-amber-600 dark:text-amber-500" size={20}/>
              </button>
            )}
            <button onClick={() => isAdmin ? handleLogout() : setShowLoginModal(true)} className={`p-1.5 rounded-xl transition-all ${isAdmin ? 'bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200' : 'bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200'}`} title={isAdmin ? "Keluar Mode Petugas" : "Login Petugas"}>
              {isAdmin ? <LogOut className="text-rose-600 dark:text-rose-500" size={20}/> : <Shield className="text-blue-900 dark:text-blue-400" size={20} />}
            </button>
          </div>
          <span className="font-black tracking-tighter text-[15px] bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-amber-500 dark:from-blue-400 dark:to-amber-400">SIKUT LAPAS</span>
        </div>
        <div className="flex gap-2 pointer-events-auto items-center">
          <div className={`${isMobileView ? 'hidden' : 'hidden sm:flex'} items-center gap-2 px-4 py-2.5 glass-card rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 shadow-sm`}>
            <Clock size={14} className="text-amber-500" />
            {formatLiveTime(currentTime)}
          </div>
          
          <button onClick={() => setIsMobileView(!isMobileView)} className="p-3.5 glass-card rounded-2xl hover:scale-105 hover:shadow-lg transition-all text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-300 dark:hover:border-slate-700" title={isMobileView ? "Beralih ke Mode Desktop" : "Beralih ke Mode Mobile"}>
            {isMobileView ? <Monitor size={18} className="text-amber-600"/> : <Smartphone size={18} className="text-blue-500"/>}
          </button>
          
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3.5 glass-card rounded-2xl hover:scale-105 hover:shadow-lg transition-all text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-300 dark:hover:border-slate-700" title={isDarkMode ? "Beralih Mode Terang" : "Beralih Mode Gelap"}>
            {isDarkMode ? <Sun size={18} className="text-amber-400"/> : <Moon size={18} className="text-indigo-600"/>}
          </button>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className={`pt-32 pb-20 px-6 mx-auto relative z-10 min-h-screen flex flex-col transition-all duration-500 w-full ${isMobileView ? 'max-w-[480px]' : 'max-w-7xl'}`}>
        
        {/* HERO SECTION */}
        <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200/50 dark:border-blue-800/30 shadow-sm mb-6">
            <div className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></div>
            Layanan Publik Pemasyarakatan
          </div>
          <h1 className={`font-black tracking-tighter leading-[1.1] text-slate-900 dark:text-white mb-4 transition-all duration-500 ${isMobileView ? 'text-4xl' : 'text-5xl md:text-7xl'}`}>
            SIKUT
          </h1>
          <h2 className={`font-black tracking-widest text-blue-900 dark:text-blue-400 mb-6 uppercase transition-all duration-500 ${isMobileView ? 'text-xs' : 'text-sm md:text-lg'}`}>
            Sistem Kunjungan Tamu
          </h2>
          <p className={`max-w-2xl mx-auto font-semibold text-slate-600 dark:text-slate-400 leading-relaxed transition-all duration-500 ${isMobileView ? 'text-xs' : 'text-sm md:text-base'} ${!isAdmin ? 'mb-10' : 'mb-10'}`}>
            Layanan pendaftaran kunjungan khusus tamu yang berkunjung ke Lapas Kelas IIB Kalabahi.
          </p>
        </div>

        {/* TAMPILAN PUBLIK: HANYA FORM PENDAFTARAN */}
        {!isAdmin ? (
          <div className="max-w-3xl mx-auto w-full animate-in fade-in zoom-in duration-500 mb-20">
            <div className="glass-card p-8 md:p-10 rounded-[3rem] shadow-2xl relative border border-blue-900/30 overflow-hidden bg-white/60 dark:bg-slate-900/40">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-800 to-amber-500"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center border border-blue-200 dark:border-blue-800/50 shrink-0">
                   <FileText size={24} className="text-blue-900 dark:text-blue-400"/>
                </div>
                <div className="text-left">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">Form Pendaftaran Kunjungan</h2>
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mt-1">Isi data instansi Anda dengan lengkap</p>
                </div>
              </div>

              <form id="publicVisitForm" onSubmit={handleSaveVisit} className="space-y-5 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 ml-1">Nama Lengkap</label>
                    <input type="text" value={formData.visitorName} onChange={e=>setFormData({...formData, visitorName: e.target.value})} placeholder="Sesuai KTP..." className="w-full px-5 py-4 premium-input rounded-2xl text-xs font-bold outline-none transition-all text-slate-900 dark:text-white" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 ml-1">Asal/Instansi</label>
                    <input type="text" value={formData.institutionName} onChange={e=>setFormData({...formData, institutionName: e.target.value})} placeholder="Contoh: Polres, Kejaksaan, Pemda..." className="w-full px-5 py-4 premium-input rounded-2xl text-xs font-bold outline-none transition-all text-slate-900 dark:text-white" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 ml-1">Tujuan Kedatangan</label>
                  <textarea value={formData.purpose} onChange={e=>setFormData({...formData, purpose: e.target.value})} rows={3} placeholder="Jelaskan secara detail tujuan kedatangan ke Lapas..." className="w-full px-5 py-4 premium-input rounded-2xl text-xs font-bold outline-none transition-all resize-y text-slate-900 dark:text-white" required></textarea>
                </div>

                <div className="pt-6">
                   <button type="submit" form="publicVisitForm" className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest btn-3d flex items-center justify-center gap-2 shadow-blue-900/30">
                     <CheckCircle2 size={18} /> Kirim Pendaftaran
                   </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* TAMPILAN ADMIN: LAPORAN & MONITORING */
          <>
            {/* DASHBOARD STATISTIK */}
            <div className="max-w-4xl mx-auto mb-10 animate-in fade-in zoom-in duration-500 w-full">
              <div className="glass-card p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-blue-500/20 relative overflow-hidden">
                <div className="text-center relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Kunjungan</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-900 to-amber-500 dark:from-blue-400 dark:to-amber-400 leading-none">{timeFilteredVisits.length}</p>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Tamu</p>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-3 bg-slate-100 dark:bg-slate-800 inline-block px-3 py-1.5 rounded-lg">
                    Terdaftar dalam sistem
                  </p>
                </div>
              </div>
            </div>

            {/* SEARCH, FILTER & SORTING BAR */}
            <div className={`max-w-5xl mx-auto glass-card p-4 rounded-[2rem] flex gap-4 shadow-xl border border-white/40 dark:border-slate-700/50 w-full ${isMobileView ? 'flex-col' : 'flex-col md:flex-row'}`}>
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari ID, Nama Pengunjung, atau Asal/Instansi..." 
                  className="w-full pl-14 pr-6 py-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-slate-900 dark:text-white"
                />
              </div>
              
              <div className={`flex gap-3 ${isMobileView ? 'flex-col' : 'flex-col sm:flex-row flex-wrap'}`}>
                <div className={`relative shrink-0 ${isMobileView ? 'w-full' : 'sm:w-44'}`}>
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
                  
                  {selectedTime.startsWith('custom:') ? (
                    <div className="flex items-center w-full relative">
                      <input 
                        type="date"
                        value={selectedTime.replace('custom:', '')}
                        onChange={(e) => setSelectedTime(`custom:${e.target.value}`)}
                        className="w-full pl-10 pr-10 py-4 bg-white/80 dark:bg-slate-900/60 border border-blue-400 dark:border-blue-600 shadow-[0_0_0_2px_rgba(59,130,246,0.2)] rounded-2xl text-[11px] font-bold uppercase tracking-wide outline-none transition-all text-slate-900 dark:text-white"
                        autoFocus
                      />
                      <button onClick={() => setSelectedTime('Semua Waktu')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-500 hover:text-white transition-colors" title="Batal Pilih Tanggal">
                        <X size={12}/>
                      </button>
                    </div>
                  ) : (
                    <>
                      <select 
                        value={selectedTime}
                        onChange={(e) => {
                          if(e.target.value === 'custom_trigger') setSelectedTime('custom:');
                          else setSelectedTime(e.target.value);
                        }}
                        className="w-full pl-10 pr-8 py-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-bold uppercase tracking-wide outline-none appearance-none cursor-pointer transition-all text-slate-900 dark:text-white"
                      >
                        <option value="Semua Waktu">Semua Waktu</option>
                        <option value="Hari Ini">Hari Ini</option>
                        <option value="Kemarin">Kemarin</option>
                        <option value="7 Hari Terakhir">7 Hari Terakhir</option>
                        <option value="30 Hari Terakhir">30 Hari Terakhir</option>
                        <option value="Bulan Ini">Bulan Ini</option>
                        <option value="Bulan Lalu">Bulan Lalu</option>
                        <option value="Tahun Ini">Tahun Ini</option>
                        <option value="custom_trigger">🗓️ Pilih Tanggal...</option>
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={14}/>
                    </>
                  )}
                </div>

                <div className={`relative shrink-0 ${isMobileView ? 'w-full' : 'sm:w-40'}`}>
                  <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-10 pr-8 py-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-bold uppercase tracking-wide outline-none appearance-none cursor-pointer transition-all text-slate-900 dark:text-white"
                  >
                    <option value="Terbaru">Terbaru</option>
                    <option value="Terlama">Terlama</option>
                    <option value="A-Z (Pengunjung)">A-Z (Nama)</option>
                    <option value="Z-A (Pengunjung)">Z-A (Nama)</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={14}/>
                </div>
              </div>
            </div>

            {/* TOMBOL AKSI LAPORAN & TAMBAH MANUAL (ADMIN) */}
            <div className={`max-w-4xl mx-auto mt-6 flex justify-center animate-in fade-in zoom-in duration-500 gap-3 ${isMobileView ? 'flex-col px-4' : 'flex-wrap'}`}>
              <button 
                onClick={() => { 
                  setEditingVisit(null); 
                  resetForm();
                  setShowVisitForm(true); 
                }} 
                className="px-8 py-4 bg-blue-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest btn-3d flex items-center justify-center gap-3 shadow-blue-900/30 shrink-0"
              >
                <Plus size={18} /> Tambah Data Manual
              </button>

              <button onClick={handleExportExcel} className="px-5 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest btn-3d flex items-center justify-center gap-2 shadow-emerald-600/30 flex-1 sm:flex-none" title="Ekspor ke Excel">
                <Table size={18} /> <span className={isMobileView ? 'inline' : 'hidden sm:inline'}>Excel</span>
              </button>
              <button onClick={handleExportWord} className="px-5 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest btn-3d flex items-center justify-center gap-2 shadow-indigo-600/30 flex-1 sm:flex-none" title="Ekspor ke Word">
                <FileText size={18} /> <span className={isMobileView ? 'inline' : 'hidden sm:inline'}>Word</span>
              </button>
              <button onClick={handlePrintReport} className="px-5 py-4 bg-slate-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest btn-3d flex items-center justify-center gap-2 shadow-slate-700/30 flex-1 sm:flex-none" title="Cetak/Print Laporan">
                <Printer size={18} /> <span className={isMobileView ? 'inline' : 'hidden sm:inline'}>Print</span>
              </button>
            </div>

            {/* VISITS GRID (ADMIN SAJA) */}
            {paginatedVisits.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-500 opacity-60 mt-10">
                <Ticket size={80} className="text-slate-400 dark:text-slate-600 mb-6" />
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-2">Data Kunjungan Kosong</h3>
                <p className="text-sm font-bold text-slate-500">Coba sesuaikan kata kunci atau filter pencarian Anda.</p>
              </div>
            ) : (
              <div className={`grid gap-6 animate-in slide-in-from-bottom-12 duration-1000 delay-150 mt-10 mb-10 w-full ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {paginatedVisits.map((visit, idx) => {
                  return (
                    <div 
                      key={visit.id} 
                      className="glass-card p-6 rounded-[2rem] border border-slate-300 dark:border-slate-700/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full bg-white/60 dark:bg-slate-900/40 relative overflow-hidden"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {/* Status Line Indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusBadgeClass().split(' ')[0]}`}></div>

                      {/* NOMOR URUT BESAR DI KANAN ATAS */}
                      <div className="absolute top-5 right-6 z-10 transition-opacity duration-300 group-hover:opacity-0 text-4xl font-black text-blue-900 dark:text-blue-400 drop-shadow-md pointer-events-none">
                        #{ (currentPage - 1) * itemsPerPage + idx + 1 }
                      </div>

                      {/* TOMBOL AKSI ADMIN */}
                      <div className="absolute top-5 right-6 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={(e) => handleTogglePin(visit.id, e)} className={`p-2 rounded-xl transition-all shadow-sm ${visit.isPinned ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white dark:bg-amber-900/40'}`} title={visit.isPinned ? "Lepas Sematan" : "Prioritaskan"}><Pin size={14} className={visit.isPinned ? "fill-current" : ""}/></button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingVisit(visit); setFormData({...visit}); setShowVisitForm(true); }} className="p-2 bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm" title="Edit Data"><Edit size={14}/></button>
                        <button onClick={(e) => handleDeleteVisit(visit.id, e)} className="p-2 bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Hapus Data"><Trash2 size={14}/></button>
                      </div>

                      <div className="flex justify-end items-start mb-4 pr-24 gap-2 relative z-20 pointer-events-none">
                        {visit.isPinned && (
                          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-800 flex items-center gap-1 shadow-sm"><Pin size={10} className="fill-current"/> Prioritas</span>
                        )}
                        <span className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm border border-transparent ${getStatusBadgeClass()}`}>
                          Terdaftar
                        </span>
                      </div>
                      
                      <div className="flex-1 mb-4 pl-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
                          {visit.id}
                        </p>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-900 dark:text-blue-400 shrink-0 border border-blue-200 dark:border-blue-800/50 overflow-hidden">
                            <UserCheck size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</p>
                            <h3 className="text-base font-black leading-snug text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                              {visit.visitorName}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                          <Building size={16} className="text-amber-600 shrink-0"/>
                          <div className="overflow-hidden flex-1">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Asal/Instansi</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{visit.institutionName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between mt-auto pl-2">
                        <div className="text-[10px] font-bold text-slate-500 flex flex-col gap-1.5">
                          <span className="flex items-center gap-1.5"><CalendarDays size={12} className="text-blue-600 dark:text-blue-400"/> {formatDateIndo(visit.date)}</span>
                          <span className="flex items-center gap-1.5"><Clock size={12} className="text-amber-500"/> Pukul {visit.time} WITA</span>
                        </div>
                        <button 
                          onClick={() => { setSelectedVisit(visit); setShowHistory(false); }}
                          className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-400 rounded-xl hover:bg-blue-900 hover:text-white transition-all shadow-sm group/btn"
                          title="Lihat Detail Kunjungan"
                        >
                          <ChevronRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAGINATION CONTROLS (ADMIN) */}
            {filteredAndSortedVisits.length > 0 && (
              <div className={`mt-auto pt-6 flex justify-between items-center gap-4 glass-card p-4 rounded-[2rem] w-full ${isMobileView ? 'flex-col' : 'flex-col sm:flex-row'}`}>
                <div className="flex items-center gap-3">
                  <ListOrdered size={18} className="text-slate-400"/>
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Tampilkan:</span>
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer text-slate-800 dark:text-white"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                  >
                    <ChevronRight size={14} className="rotate-180"/> Prev
                  </button>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Hal {currentPage} dari {totalPages || 1}
                  </span>
                  <button 
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                  >
                    Next <ChevronRight size={14}/>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL LOGIN ADMIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card p-10 rounded-[3rem] w-full max-w-sm shadow-2xl relative text-center border border-blue-900/30 overflow-hidden">
            <button onClick={() => { setShowLoginModal(false); setLoginError(''); }} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-rose-500 transition-colors"><X size={18}/></button>
            <Shield size={60} className="text-blue-900 mx-auto mb-6 drop-shadow-md"/>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Akses Petugas</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-8">Login untuk Memantau Data</p>

            {loginError && (
              <div className="mb-4 p-3 bg-rose-100/80 border border-rose-300 dark:bg-rose-900/30 dark:border-rose-800 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
                <AlertCircle size={16} />
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Username</label>
                <input type="text" value={loginCreds.username} onChange={e=>setLoginCreds({...loginCreds, username: e.target.value})} className="w-full px-5 py-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-900 font-bold text-sm transition-all" placeholder="admin" required autoFocus/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={loginCreds.password} onChange={e=>setLoginCreds({...loginCreds, password: e.target.value})} className="w-full px-5 py-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-900 font-black text-center tracking-[0.3em] text-sm transition-all" placeholder="password" required/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-900 transition-colors p-1" title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}>
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full py-4 mt-2 bg-blue-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest btn-3d transition-colors hover:text-white">Masuk Sistem</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL KUNJUNGAN (UNTUK ADMIN) */}
      {selectedVisit && isAdmin && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedVisit(null)}>
          <div className="glass-card p-0 rounded-[3rem] w-full max-w-2xl shadow-[0_0_50px_rgba(30,58,138,0.15)] relative border border-blue-900/30 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="p-8 pb-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 relative shrink-0">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-800 to-amber-500"></div>
              <button onClick={() => setSelectedVisit(null)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors">
                <X size={18}/>
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <span className="inline-block px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 border border-slate-300 dark:border-slate-700">
                    ID: {selectedVisit.id}
                  </span>
                  <div className="flex gap-2 items-center mb-1">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest text-white bg-blue-500`}>Status: Terdaftar</span>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2">{selectedVisit.visitorName}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Building size={16} className="text-amber-600"/> Asal/Instansi: <span className="text-slate-900 dark:text-white bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">{selectedVisit.institutionName}</span>
                </p>
              </div>
            </div>

            {/* Modal Body with TABS */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 shrink-0 px-8 pt-4 overflow-x-auto hide-scrollbar">
               <button onClick={()=>setShowHistory(false)} className={`pb-3 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${!showHistory ? 'border-blue-900 text-blue-900 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Detail Kunjungan</button>
               <button onClick={()=>setShowHistory(true)} className={`pb-3 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${showHistory ? 'border-blue-900 text-blue-900 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                 Riwayat Edit {selectedVisit.history && selectedVisit.history.length > 0 && <span className="bg-amber-500 text-white px-1.5 rounded-full text-[9px]">{selectedVisit.history.length}</span>}
               </button>
            </div>

            <div className="p-8 overflow-y-auto bg-white/30 dark:bg-slate-900/30 flex-1">
              {!showHistory ? (
                // TAB 1: INFO DETAIL KUNJUNGAN
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <p className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1.5 mb-1"><CalendarDays size={12}/> Tanggal</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{formatDateIndo(selectedVisit.date)}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <p className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1.5 mb-1"><Clock size={12}/> Waktu</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{selectedVisit.time} WITA</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2"><FileText size={14}/> Tujuan Kedatangan</h4>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[100px]">
                        {selectedVisit.purpose || '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-slate-400">Pembaruan Terakhir Oleh: <span className="text-amber-600">{selectedVisit.updatedBy}</span></p>
                  </div>
                </div>
              ) : (
                // TAB 2: RIWAYAT
                <div className="space-y-6">
                   <div className="relative pl-6 border-l-2 border-blue-900/30 space-y-8">
                     {selectedVisit.history && selectedVisit.history.length > 0 ? (
                       selectedVisit.history.map((hist, i) => (
                         <div key={i} className="relative">
                           <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${i===0 ? 'bg-blue-900' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                           <div className={`p-4 rounded-2xl border ${i===0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' : 'bg-white/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'}`}>
                             <div className="flex justify-between items-start mb-2">
                               <span className="text-[11px] font-black uppercase text-slate-600 dark:text-slate-400">Update {hist.version}</span>
                               <span className="text-[10px] font-bold text-slate-500">{formatDateIndo(hist.date)}</span>
                             </div>
                             <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Oleh: {hist.updatedBy}</p>
                             <p className="text-[12px] font-medium text-slate-800 dark:text-slate-200 bg-white/50 dark:bg-slate-900/50 p-2.5 rounded-lg mt-2 border border-slate-100 dark:border-slate-800">{hist.description}</p>
                           </div>
                         </div>
                       ))
                     ) : (
                       <p className="text-xs font-bold text-slate-500 ml-2">Belum ada riwayat pembaruan data.</p>
                     )}
                   </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex flex-col sm:flex-row gap-3 mt-auto shrink-0">
              <button onClick={() => setSelectedVisit(null)} className="w-full py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH/EDIT KUNJUNGAN (HANYA UNTUK ADMIN EDIT MANUAL) */}
      {showVisitForm && isAdmin && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card p-0 rounded-[3rem] w-full max-w-2xl shadow-[0_0_50px_rgba(30,58,138,0.15)] relative border border-blue-900/30 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            
            <div className="p-8 pb-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 relative shrink-0">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-800 to-amber-500"></div>
              <button onClick={() => setShowVisitForm(false)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors">
                <X size={18}/>
              </button>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center border border-blue-200 dark:border-blue-800/50">
                   {editingVisit ? <Edit size={24} className="text-blue-900 dark:text-blue-400"/> : <Plus size={24} className="text-blue-900 dark:text-blue-400"/>}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{editingVisit ? 'Edit Data Kunjungan' : 'Tambah Data Kunjungan Manual'}</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">SIKUT Lapas Kalabahi • Petugas: {adminUser.username}</p>
                </div>
              </div>
            </div>

            <div className="p-8 overflow-y-auto bg-white/30 dark:bg-slate-900/30 flex-1 hide-scrollbar">
              <form id="visitFormAdmin" onSubmit={handleSaveVisit} className="space-y-5 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 ml-1">Nama Lengkap</label>
                    <input type="text" value={formData.visitorName} onChange={e=>setFormData({...formData, visitorName: e.target.value})} placeholder="Sesuai KTP..." className="w-full px-5 py-4 premium-input rounded-2xl text-xs font-bold outline-none transition-all text-slate-900 dark:text-white" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 ml-1">Asal/Instansi</label>
                    <input type="text" value={formData.institutionName} onChange={e=>setFormData({...formData, institutionName: e.target.value})} placeholder="Contoh: Polres, Kejaksaan, Pemda..." className="w-full px-5 py-4 premium-input rounded-2xl text-xs font-bold outline-none transition-all text-slate-900 dark:text-white" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 ml-1">Tujuan Kedatangan</label>
                  <textarea value={formData.purpose} onChange={e=>setFormData({...formData, purpose: e.target.value})} rows={3} placeholder="Jelaskan secara detail tujuan kedatangan ke Lapas..." className="w-full px-5 py-4 premium-input rounded-2xl text-xs font-bold outline-none transition-all resize-y text-slate-900 dark:text-white" required></textarea>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex gap-3 mt-auto shrink-0">
              <button onClick={() => setShowVisitForm(false)} className="flex-1 py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                Batal
              </button>
              <button type="submit" form="visitFormAdmin" className="flex-[2] py-4 bg-blue-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest btn-3d flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> Simpan Data
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI LOGOUT */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card p-8 rounded-3xl w-full max-w-sm shadow-2xl relative text-center border border-rose-500/30">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <AlertCircle size={32} className="text-rose-600 dark:text-rose-500"/>
            </div>
            <h3 className="text-lg font-black mb-2 text-slate-900 dark:text-white">Keluar Sesi Petugas?</h3>
            <p className="text-sm font-bold text-slate-500 mb-8">Anda harus login kembali untuk memantau data kunjungan.</p>
            
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Batal</button>
              <button onClick={() => { setAdminUser(null); setShowLogoutConfirm(false); showToast("Berhasil Keluar"); }} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20">Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN ADMIN */}
      {showSettings && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card p-0 rounded-[3rem] w-full max-w-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] relative border border-amber-500/30 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 relative shrink-0">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-amber-600"></div>
              <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors">
                <X size={18}/>
              </button>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center border border-amber-200 dark:border-amber-800/50">
                   <Settings size={24} className="text-amber-600 dark:text-amber-500"/>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Pengaturan Sistem</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Kelola Kredensial & Sistem</p>
                </div>
              </div>
            </div>

            <div className="p-8 overflow-y-auto bg-white/30 dark:bg-slate-900/30 flex-1 space-y-8 hide-scrollbar">
              
              {/* Seksi Akun Super Admin */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Shield size={16}/> Akun Super Admin</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 ml-1">Username Super Admin</label>
                    <input type="text" value={settingsForm.superUsername || ''} onChange={e=>setSettingsForm({...settingsForm, superUsername: e.target.value})} className="w-full px-4 py-3 premium-input rounded-xl text-xs font-bold outline-none transition-all text-slate-900 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 ml-1">Password Super Admin</label>
                    <div className="relative">
                      <input type={showSettingsPassword ? "text" : "password"} value={settingsForm.superPassword || ''} onChange={e=>setSettingsForm({...settingsForm, superPassword: e.target.value})} className="w-full px-4 py-3 premium-input rounded-xl text-xs font-bold outline-none transition-all text-slate-900 dark:text-white" />
                      <button type="button" onClick={() => setShowSettingsPassword(!showSettingsPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600 transition-colors p-1">
                        {showSettingsPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-200 dark:border-slate-800"/>

              {/* Seksi Akun Petugas */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><User size={16}/> Akun Petugas Biasa</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 ml-1">Username Petugas</label>
                    <input type="text" value={settingsForm.username} onChange={e=>setSettingsForm({...settingsForm, username: e.target.value})} className="w-full px-4 py-3 premium-input rounded-xl text-xs font-bold outline-none transition-all text-slate-900 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 ml-1">Password Petugas</label>
                    <div className="relative">
                      <input type={showSettingsPassword ? "text" : "password"} value={settingsForm.password} onChange={e=>setSettingsForm({...settingsForm, password: e.target.value})} className="w-full px-4 py-3 premium-input rounded-xl text-xs font-bold outline-none transition-all text-slate-900 dark:text-white" />
                      <button type="button" onClick={() => setShowSettingsPassword(!showSettingsPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600 transition-colors p-1">
                        {showSettingsPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-400 ml-1">Batas Waktu Auto Logout (Menit)</label>
                    <input type="number" min="1" value={settingsForm.autoLogoutMinutes} onChange={e=>setSettingsForm({...settingsForm, autoLogoutMinutes: parseInt(e.target.value) || 1})} className="w-full px-4 py-3 premium-input rounded-xl text-xs font-bold outline-none transition-all text-slate-900 dark:text-white" />
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex gap-3 mt-auto shrink-0">
              <button onClick={() => setShowSettings(false)} className="flex-1 py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                Batal
              </button>
              <button onClick={() => {
                const newAdminCreds = { username: settingsForm.username, password: settingsForm.password };
                const newSuperAdminCreds = { username: settingsForm.superUsername, password: settingsForm.superPassword };
                
                setAdminCreds(newAdminCreds);
                localStorage.setItem('sikutAdminCreds', JSON.stringify(newAdminCreds));
                
                setSuperAdminCreds(newSuperAdminCreds);
                localStorage.setItem('sikutSuperAdminCreds', JSON.stringify(newSuperAdminCreds));
                
                setAutoLogoutMinutes(settingsForm.autoLogoutMinutes);
                localStorage.setItem('sikutAutoLogout', settingsForm.autoLogoutMinutes.toString());
                
                showToast('Pengaturan Berhasil Disimpan!');
                setShowSettings(false);
              }} className="flex-[2] py-4 bg-amber-500 text-slate-900 rounded-2xl font-black uppercase text-[11px] tracking-widest btn-3d-gold flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI GENERIC */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card p-8 rounded-3xl w-full max-w-sm shadow-2xl relative text-center border border-rose-500/30">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <AlertCircle size={32} className="text-rose-600 dark:text-rose-500"/>
            </div>
            <h3 className="text-lg font-black mb-2 text-slate-900 dark:text-white">Konfirmasi</h3>
            <p className="text-sm font-bold text-slate-500 mb-8">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Batal</button>
              <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog({ isOpen: false, message: '', onConfirm: null }); }} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20">Ya, Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROMPT GENERIC */}
      {promptDialog.isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card p-8 rounded-3xl w-full max-w-sm shadow-2xl relative text-center border border-amber-500/30">
            <h3 className="text-lg font-black mb-4 text-slate-900 dark:text-white">{promptDialog.message}</h3>
            <input type="text" value={promptDialog.value} onChange={e => setPromptDialog({...promptDialog, value: e.target.value})} className="w-full px-4 py-3 premium-input rounded-xl text-sm font-bold outline-none transition-all text-slate-900 dark:text-white mb-6" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setPromptDialog({ isOpen: false, message: '', value: '', onConfirm: null })} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Batal</button>
              <button onClick={() => { promptDialog.onConfirm(promptDialog.value); setPromptDialog({ isOpen: false, message: '', value: '', onConfirm: null }); }} className="flex-1 py-3 bg-amber-500 text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/20">Simpan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
