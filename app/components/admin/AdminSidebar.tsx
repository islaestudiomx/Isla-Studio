"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Dumbbell,
  Users,
  BookOpen,
  Package,
  UserCircle,
  Info,
  PartyPopper,
  Cake,
  BarChart3,
  LogOut,
} from "lucide-react";

const NAV_SECTIONS = [
  { label: "Resumen", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Horarios", href: "/admin/horarios", icon: Calendar },
  { label: "Tipos de clase", href: "/admin/tipos-clase", icon: Layers },
  { label: "Disciplinas", href: "/admin/disciplinas", icon: Dumbbell },
  { label: "Instructores", href: "/admin/instructores", icon: Users },
  { label: "Reservas", href: "/admin/reservas", icon: BookOpen },
  { label: "Paquetes", href: "/admin/paquetes", icon: Package },
  { label: "Clientes", href: "/admin/clientes", icon: UserCircle },
  { label: "Clientes Info", href: "/admin/clientes-info", icon: Info },
  { label: "Eventos", href: "/admin/eventos", icon: PartyPopper },
  { label: "Birthday", href: "/admin/birthday", icon: Cake },
  { label: "Reportes", href: "/admin/reportes", icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <aside className="w-64 shrink-0 bg-[#2C2421] min-h-screen flex flex-col fixed left-0 top-0 bottom-0">
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="font-serif text-lg text-white tracking-wide">
          <a href="/">Isla Studio</a>
          
        </h1>
        <p className="text-xs text-white/40 mt-0.5">Panel Admin</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_SECTIONS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#F5F2EF] text-[#2C2421]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}