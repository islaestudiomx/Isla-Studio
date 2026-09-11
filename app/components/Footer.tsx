// components/Footer.tsx
import Link from "next/link";
import { MapPin } from "lucide-react";

const FOOTER_NAV = [
  { label: "Inicio", href: "/" },
  { label: "Horarios", href: "/horarios" },
  { label: "Eventos", href: "/eventos" },
  { label: "Paquetes", href: "/paquetes" },
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#F5F2EF] border-t border-[#2C2421]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h2 className="font-serif text-2xl tracking-wide text-[#2C2421] mb-4">
              ISLA STUDIO
            </h2>
            <p className="text-sm text-[#2C2421]/70 leading-relaxed max-w-xs">
              Tu espacio para moverte, crecer y sentirte bien. Clases de
              Barre, Yoga y Pilates.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <Link
                href="https://www.instagram.com/islastudio.mx/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-[#2C2421]/20 flex items-center justify-center text-[#2C2421] hover:bg-[#2C2421] hover:text-white transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
              </Link>
              
              <Link
                href="https://tiktok.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-[#2C2421]/20 flex items-center justify-center text-[#2C2421] hover:bg-[#2C2421] hover:text-white transition-colors"
              >
                <TikTokIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-[#2C2421]/50 uppercase mb-4">
              Navegación
            </h3>
            <ul className="space-y-3">
              {FOOTER_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#2C2421]/80 hover:text-[#2C2421] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dirección */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-[#2C2421]/50 uppercase mb-4">
              Dirección
            </h3>
            <p className="flex items-start gap-2 text-sm text-[#2C2421]/80 leading-relaxed">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#2C2421]/60" />
              <span>
                Andador Guadalupano #51
                <br />
                San Cristobal de las Casas.
              </span>
            </p>
          </div>
        </div>

        <div className="h-px bg-[#2C2421]/10 my-10" />

        <p className="text-xs text-[#2C2421]/50 tracking-wide">
          © 2026 ISLA STUDIO. TODOS LOS DERECHOS RESERVADOS.
        </p>
      </div>
    </footer>
  );
}