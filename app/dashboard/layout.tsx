"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Squares2X2Icon, 
  AcademicCapIcon, 
  ExclamationTriangleIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  BellIcon,
  SignalIcon
} from "@heroicons/react/24/outline";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const topbarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Multi-tenant: read dosen info from localStorage
  const [dosenName, setDosenName] = useState("Dr. Dosen");
  const [dosenInitials, setDosenInitials] = useState("DR");

  useEffect(() => {
    const name = localStorage.getItem('evalora_name') || 'Dr. Dosen';
    setDosenName(name);
    // Generate initials from name
    const parts = name.split(' ');
    const initials = parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
    setDosenInitials(initials);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(topbarRef.current, {
        y: -30, opacity: 0, duration: 0.6, delay: 0.1, ease: "power2.out"
      });
      gsap.from(contentRef.current, {
        opacity: 0, y: 20, duration: 0.6, delay: 0.2, ease: "power2.out"
      });
    });
    return () => ctx.revert();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('evalora_token');
    localStorage.removeItem('evalora_role');
    localStorage.removeItem('evalora_name');
    localStorage.removeItem('evalora_dosen_id');
    localStorage.removeItem('evalora_mata_kuliah');
    // Clear cookies by calling a logout endpoint or just redirect
    document.cookie = 'evalora_dosen_id=; path=/; max-age=0';
    document.cookie = 'evalora_token=; path=/; max-age=0';
    document.cookie = 'evalora_dosen_name=; path=/; max-age=0';
    router.push('/');
  };

  const navLinks = [
    { name: "Dashboard", icon: Squares2X2Icon, href: "/dashboard" },
    { name: "Penilaian", icon: AcademicCapIcon, href: "/dashboard/grades" },
    { name: "Sanggahan", icon: ExclamationTriangleIcon, href: "/dashboard/sanggah" },
    { name: "Pengaturan", icon: Cog6ToothIcon, href: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -250, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col justify-between z-20"
      >
        <div>
          <div className="h-20 flex items-center px-8 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                <span className="font-bold text-white text-lg leading-none">E</span>
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
                EVALORA
              </span>
            </div>
          </div>
          
          <div className="px-4 py-8 space-y-2 relative">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Menu Utama
            </p>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link key={link.name} href={link.href} className="relative block">
                  <motion.div
                    whileHover={{ scale: isActive ? 1 : 1.02, x: isActive ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-300 z-10 relative
                      ${isActive ? 'text-indigo-400 font-medium' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="z-10">{link.name}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-indigo-500/10 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <motion.button 
            onClick={handleLogout}
            whileHover={{ x: 5, backgroundColor: "rgba(239, 68, 68, 0.1)", color: "rgb(248, 113, 113)" }}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 rounded-xl transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Keluar
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Topbar */}
        <header ref={topbarRef} className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
             <h2 className="text-lg font-medium text-gray-200">
               Selamat Datang, <span className="text-white font-semibold">{dosenName}</span>
             </h2>
          </div>
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.4 }}
              className="relative text-gray-400 hover:text-white transition-colors"
            >
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0a0a0a] animate-pulse"></span>
            </motion.button>
            <div className="flex items-center gap-3 border-l border-white/10 pl-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/30 flex items-center justify-center font-medium shadow-inner text-sm">
                {dosenInitials}
              </div>
              <div className="text-sm">
                <p className="font-medium text-white">{dosenName}</p>
                <p className="text-gray-500 text-xs">Fakultas Teknik</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main ref={contentRef} className="flex-1 overflow-y-auto p-8 relative z-10 scrollbar-hide">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
