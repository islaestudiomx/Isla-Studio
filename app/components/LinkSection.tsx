// components/LinksSection.tsx
import Link from "next/link";

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

const LINKS = [
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: InstagramIcon,
  },
  {
    name: "TikTok",
    href: "https://tiktok.com",
    icon: TikTokIcon,
  },
];

export default function LinksSection() {
  return (
    <section className="bg-[#F5F2EF] py-20 px-6 md:px-12">
      <div className="max-w-xl mx-auto text-center">
        {/* Título de la sección */}
        <h2 className="font-serif text-3xl md:text-4xl text-[#2C2421] tracking-wide mb-12">
          Enlaces
        </h2>

        {/* Lista de botones */}
        <div className="flex flex-col gap-4">
          {LINKS.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-4 px-6 border border-[#2C2421]/10 flex items-center justify-center gap-3 text-[#2C2421] shadow-sm hover:shadow-md hover:bg-[#2C2421] hover:text-white transition-all duration-300"
              >
                <IconComponent className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-semibold text-base tracking-wide">
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}