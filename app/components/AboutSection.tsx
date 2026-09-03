import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="w-full bg-[#f4f7fa] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Lado Izquierdo: Imagen */}
        <div className="relative w-full rounded-sm shadow-sm overflow-hidden">
          <img
            src="/aboutimg.jpg"
            alt="Equipo Isla Studio"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Lado Derecho: Contenido */}
        <div className="flex flex-col items-start text-(--gray)">
          <h2 className="text-3xl md:text-5xl text-(--gray) font-semibold leading-tight mb-6 tracking-tight">
            Descubre el poder de superar tus límites
          </h2>
          
          <div className="space-y-4 text-justify text-gray-700 text-sm font-medium md:text-base leading-relaxed mb-10">
            <p>
              Isla es un espacio diseñado para desafiarte. Hemos creado el entorno 
              perfecto para que conectes con tu fuerza y lleves tu capacidad física al siguiente nivel.
            </p>
            <p>
              Nuestra metodología se enfoca en resultados sólidos, ayudándote a construir una 
              disciplina inquebrantable mientras optimizas tu energía y potencias tu bienestar.
            </p>
          </div>

          <button className="border-2 font-bold text-tertiary px-10 py-3 rounded-md hover:bg-black hover:cursor-pointer hover:text-white transition-all duration-300">
            <a href="/paquetes">Inicia ya</a>
          </button>
        </div>

      </div>
    </section>
  );
}