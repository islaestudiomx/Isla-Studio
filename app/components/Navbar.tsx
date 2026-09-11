"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Calendar, Zap, Package, Menu,
  ChevronRight, X, ArrowLeft
} from "lucide-react";
import { supabase } from '@/utils/supabase'

const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Horarios", href: "/horarios" },
  { label: "Eventos", href: "/eventos" },
  { label: "Paquetes", href: "/paquetes" },
];

const BOTTOM_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Horarios", href: "/horarios", icon: Calendar },
  { label: "Eventos", href: "/Eventos", icon: Zap },
  { label: "Paquetes", href: "/paquetes", icon: Package },
];

const MENU_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Inicio", href: "/" },
  { label: "Horarios", href: "/horarios" },
  { label: "Disciplinas", href: "/disciplinas" },
  { label: "Paquetes", href: "/paquetes" },
];

const ACCOUNT_LINKS = [
  { label: "Mi perfil", href: "/perfil" },
  { label: "Mis reservas", href: "/reservas" },
  { label: "Mis membresías", href: "/membresias" },
  { label: "Mis facturas", href: "/facturas" },
];

// ── Mobile Menu (fullscreen) ───────────────────────────────────
function MobileMenu({
  isOpen,
  onClose,
  userData,
}: {
  isOpen: boolean
  onClose: () => void
  userData: { name: string; email: string; initials: string } | null
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white md:hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Atrás
        </button>
        <span className="font-semibold text-gray-900">Menú</span>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-4 px-4 pb-24">
        {/* Nav links */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-3">
          {MENU_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors
                ${i < MENU_LINKS.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <span className="text-gray-800 text-sm font-medium">{link.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Logged in */}
        {userData && (
          <>
            <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 rounded-2xl mb-3">
              <div className="w-10 h-10 rounded-full bg-[#2C2421] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">{userData.initials}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{userData.name}</p>
                <p className="text-gray-400 text-xs">{userData.email}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-3">
              {ACCOUNT_LINKS.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors
                    ${i < ACCOUNT_LINKS.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className="text-gray-800 text-sm">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>

            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/'
              }}
              className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-gray-100 hover:bg-red-50 transition-colors"
            >
              <span className="text-red-500 text-sm font-medium">Cerrar sesión</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </>
        )}

        {!userData && (
          <Link
            href="/login"
            onClick={onClose}
            className="w-full flex items-center justify-center bg-[#2C2421] hover:bg-black text-white font-semibold px-5 py-3.5 rounded-2xl text-sm transition-colors"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </div>
  )
}

// ── Desktop Account Drawer ─────────────────────────────────────
function AccountDrawer({
  isOpen,
  onClose,
  userData,
}: {
  isOpen: boolean
  onClose: () => void
  userData: { name: string; email: string; initials: string } | null
}) {
  if (!isOpen || !userData) return null

  return (
    <>
      <div className="hidden md:block fixed inset-0 z-40 bg-black/30 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed z-50 bg-white shadow-2xl flex flex-col inset-0 md:inset-auto md:top-0 md:right-0 md:bottom-0 md:w-96">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900 text-base">Cuenta</span>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="w-12 h-12 rounded-full bg-[#2C2421] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">{userData.initials}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{userData.name}</p>
              <p className="text-gray-500 text-xs">{userData.email}</p>
            </div>
          </div>

          <div className="h-px bg-gray-100 mx-4" />

          <nav className="py-2">
            {[...MENU_LINKS, ...ACCOUNT_LINKS].map((link) => (
              <Link
                key={link.label + link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-800 text-sm">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </nav>

          <div className="h-2 bg-gray-100" />

          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/'
            }}
            className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-gray-100 transition-colors"
          >
            <span className="text-red-600 text-sm font-medium">Cerrar sesión</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main Navbar ────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userData, setUserData] = useState<{ name: string; email: string; initials: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  // Verificamos si estamos en la página de inicio
  const isHome = pathname === "/"

  // Detectar el scroll de la página
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!isMounted) return;

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        if (!isMounted) return;

        const parts = (profile?.full_name ?? '').split(' ').filter(Boolean).slice(0, 2)
        const initials = parts.map((p: string) => p[0].toUpperCase()).join('') || '??'

        setUserData({
          name: profile?.full_name || 'Usuario',
          email: user.email || '',
          initials,
        })
      } else {
        setUserData(null)
      }
      
      if (isMounted) setLoading(false)
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION') return;
      fetchUser()
    })

    return () => {
      isMounted = false;
      subscription.unsubscribe()
    }
  }, [])

  // El navbar tendrá fondo sólido y texto oscuro si NO estamos en Home, o si ya se hizo scroll en Home.
  const useSolidNav = !isHome || isScrolled

  return (
    <>
      {/* ── Top bar con transición de scroll ── */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 flex items-center ${
          useSolidNav 
            ? "bg-[#F5F2EF]/90 backdrop-blur-md border-b border-[#2C2421]/10 shadow-xs" 
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex items-center justify-between">

          {/* Logo o Marca */}
          <a 
            href="/" 
            className={`font-serif tracking-wider text-base md:text-lg transition-colors ${
              useSolidNav ? "text-[#2C2421]" : "text-white"
            }`}
          >
            ISLA
          </a>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                    useSolidNav 
                      ? (isActive ? 'text-[#2C2421] font-semibold' : 'text-gray-600 hover:text-[#2C2421]')
                      : (isActive ? 'text-white font-semibold' : 'text-white/80 hover:text-white')
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full ${
                      useSolidNav ? "bg-[#2C2421]" : "bg-white"
                    }`} />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard"
              className={`hidden md:block text-sm font-medium transition-colors ${
                useSolidNav ? "text-gray-700 hover:text-[#2C2421]" : "text-white/90 hover:text-white"
              }`}
            >
              Dashboard
            </Link>

            {!loading && (
              userData ? (
                <button onClick={() => setDrawerOpen(true)} className="focus:outline-none cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-[#2C2421] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                    <span className="text-xs font-bold">{userData.initials}</span>
                  </div>
                </button>
              ) : (
                <Link
                  href="/login"
                  className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                    useSolidNav 
                      ? "bg-[#2C2421] text-white hover:bg-black" 
                      : "bg-white text-[#2C2421] hover:bg-stone-100 shadow-md"
                  }`}
                >
                  Iniciar sesión
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#F5F2EF] border-t border-[#2C2421]/10 h-16 shadow-lg">
        <div className="grid grid-cols-5 h-full">
          {BOTTOM_NAV.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={label}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors
                  ${isActive ? 'text-[#2C2421] font-semibold' : 'text-gray-500 hover:text-[#2C2421]'}`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            )
          })}

          {/* Menú button */}
          <button
            onClick={() => setMenuOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors
              ${menuOpen ? 'text-[#2C2421] font-semibold' : 'text-gray-500 hover:text-[#2C2421]'}`}
          >
            <Menu className="w-5 h-5" />
            <span>Menú</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile fullscreen menu ── */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        userData={userData}
      />

      {/* ── Desktop account drawer ── */}
      <AccountDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userData={userData}
      />
    </>
  )
}