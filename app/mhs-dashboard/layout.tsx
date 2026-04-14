"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function MhsDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [mhsName, setMhsName] = useState("Mahasiswa");
  const [mhsInitials, setMhsInitials] = useState("MH");

  useEffect(() => {
    const name = localStorage.getItem('evalora_name') || 'Mahasiswa';
    setMhsName(name);
    const parts = name.split(' ');
    const initials = parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
    setMhsInitials(initials);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('evalora_token');
    localStorage.removeItem('evalora_role');
    localStorage.removeItem('evalora_name');
    localStorage.removeItem('evalora_mhs_nim');
    
    // Clear cookies explicitly using match
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    router.push('/');
  };

  const navLinks = [
    { name: "Beranda", icon: "home", href: "/mhs-dashboard" },
    { name: "Pengaturan", icon: "settings", href: "/mhs-dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Sidebar - Google Workspace Style */}
      <div className="w-[280px] bg-white flex flex-col justify-between z-20 shrink-0 shadow-sm border-r border-slate-200">
        <div>
          {/* Logo Area */}
          {/* Logo Area */}
          <div className="h-32 flex items-center px-4 overflow-hidden">
            <img src="/name-evalora.png" alt="Evalora" className="h-[150px] w-auto min-w-[200px] object-contain" />
          </div>
          
          <div className="pt-4 pr-3 pl-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.name} href={link.href} className="block">
                  <div
                    className={`flex items-center gap-4 px-4 py-2.5 rounded-r-full transition-colors duration-200 ${
                      isActive 
                        ? 'bg-accent text-primary font-medium' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[22px] ${isActive ? '' : 'text-slate-500'}`}>
                      {link.icon}
                    </span>
                    <span className="text-sm tracking-tight">{link.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-3">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-2.5 w-full text-slate-600 rounded-r-full hover:bg-slate-100 hover:text-red-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span className="text-sm font-medium tracking-tight">Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50">
        
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-normal text-slate-800 tracking-tight">
               Halo, <span className="font-semibold">{mhsName}</span>
             </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">notifications</span>
            </button>
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">apps</span>
            </button>
            
            <div className="pl-4 ml-2 border-l border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent text-primary flex items-center justify-center font-semibold text-sm border border-primary/20 cursor-pointer hover:shadow-md transition-shadow">
                {mhsInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
