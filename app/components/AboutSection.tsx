// components/AboutSection.tsx
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="w-full bg-[#F5F2EF] py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Lado Izquierdo: Imagen con estilo moderno */}
        <div className="relative w-full rounded-2xl shadow-sm overflow-hidden border border-[#2C2421]/10 aspect-[4/3]">
          <img
            src="/aboutimg.jpg"
            alt="Equipo Isla Studio"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Lado Derecho: Contenido */}
        <div className="flex flex-col items-start text-[#2C2421]">
          {/* Pequeño subtítulo decorativo */}

          <h2 className="font-serif text-4xl md:text-4xl text-[#2C2421] leading-tight mb-6 tracking-wide">
            Descubre el poder de superar tus límites
          </h2>
          
          <div className="space-y-4 text-justify text-[#2C2421]/70 text-lg md:text-base leading-relaxed mb-8">
            <p>
              Isla es un espacio diseñado para desafiarte. Hemos creado el entorno 
              perfecto para que conectes con tu fuerza y lleves tu capacidad física al siguiente nivel.
            </p>
            <p>
              Nuestra metodología se enfoca en resultados sólidos, ayudándote a construir una 
              disciplina inquebrantable mientras optimizas tu energía y potencias tu bienestar.
            </p>
          </div>

          <Link
            href="/paquetes"
            className="bg-[#2C2421] hover:bg-black text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            Inicia ya
          </Link>
        </div>

      </div>
    </section>
  );
}