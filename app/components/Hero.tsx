import Image from "next/image";

export default function Hero() {
  return (
    <div className="grow flex flex-col font-sans">
      {/* --- HERO SECTION --- */}
      <section className="relative h-screen w-full flex flex-col justify-end items-start text-white antialiased pb-24 pl-6 md:pl-16 lg:pl-20">
        
        {/* Contenedor de la Imagen de Fondo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.jpg" // Asegúrate de tener esta imagen en tu carpeta /public
            alt="Persona haciendo Pilates en estudio"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        {/* Overlay oscuro para contraste (oscurece la imagen de fondo) */}
        <div className="absolute inset-0 z-10 bg-black/60" aria-hidden="true" />

        {/* Contenido del Hero (Alineado a la izquierda, abajo) */}
        <div className="relative z-20 text-left max-w-2xl flex flex-col items-start drop-shadow-md">
          
          {/* Breadcrumb o Título Pequeño Superior */}
          <p className="text-sm font-medium tracking-wider uppercase text-stone-200 mb-8">
            ISLA &nbsp;·&nbsp; STUDIO
          </p>

          {/* Título Principal Combinado (Normal + Itálica) */}
          {/* Usamos familias de fuentes distintas si tienes serif e itálica configuradas. 
              Aquí simulamos la itálica con la clase 'italic' y ajustamos el interlineado */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-none mb-12 text-balance">
            Muévete <span className="block italic font-light text-stone-200 mt-2">con intención</span>
          </h1>
          
          {/* Separador Gráfico (Línea fina) */}
          <hr className="w-16 border-t-2 border-stone-300/70 mb-10" />
          
          {/* Párrafo de Descripción */}
          <p className="text-lg md:text-xl font-normal mb-16 text-stone-100/90 max-w-xl text-balance">
            Un espacio donde el movimiento se convierte en ritual. Pilates, barre y movilidad para transformar tu cuerpo desde adentro.
          </p>
          
          {/* Contenedor de Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {/* Botón 1: Fondo Claro */}
            <a
              href="/horarios"
              className="inline-block bg-[#E8E2DD] text-[#332F2C] px-10 py-4 rounded-full font-semibold text-base hover:bg-white transition-colors shadow-lg text-center"
            >
              Ver horarios
            </a>
            
            {/* Botón 2: Borde Transparente */}
            <a
              href="/nuestras-clases"
              className="inline-block bg-transparent border border-[#715E4B] text-white px-10 py-4 rounded-full font-semibold text-base transition-colors text-center"
            >
              Nuestros Paquetes
            </a>
          </div>
          
        </div>

      </section>
    </div>
  );
}