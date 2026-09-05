// components/HowToBook.tsx
import { UserPlus, Ticket, CalendarDays, Sparkles } from "lucide-react";

const STEPS = [
  {
    step: "PASO 1",
    title: "Crea tu perfil",
    description: "Regístrate o inicia sesion en nuestra plataforma en segundos para comenzar tu experiencia.",
    icon: UserPlus,
  },
  {
    step: "PASO 2",
    title: "Adquiere tus créditos",
    description: "Selecciona el paquete ideal que se adapte a tu ritmo y metas de entrenamiento.",
    icon: Ticket,
  },
  {
    step: "PASO 3",
    title: "Reserva tu lugar",
    description: "Explora nuestros horarios y agenda tu clase favorita con anticipación.",
    icon: CalendarDays,
  },
  {
    step: "PASO 4",
    title: "¡A entrenar!",
    description: "Todo listo. Prepara tu ropa cómoda y ven a disfrutar de la energía del estudio. ¡Nos vemos!",
    icon: Sparkles,
  },
];

export default function HowToBook() {
  return (
    <section className="bg-[#F5F2EF] py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Título de la sección */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-[#2C2421] tracking-wide">
            ¿Cómo reservo?
          </h2>
          <div className="w-12 h-0.5 bg-[#2C2421]/20 mx-auto mt-4" />
        </div>

        {/* Grid de pasos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-[#2C2421]/10 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Icon Container */}
                <div className="w-14 h-14 rounded-2xl bg-[#F5F2EF] border border-[#2C2421]/10 flex items-center justify-center text-[#2C2421] mb-6">
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Paso número */}
                <span className="text-[11px] font-semibold tracking-widest text-[#2C2421]/50 uppercase mb-2">
                  {item.step}
                </span>

                {/* Título */}
                <h3 className="font-serif text-xl text-[#2C2421] mb-3">
                  {item.title}
                </h3>

                {/* Descripción */}
                <p className="text-sm text-[#2C2421]/70 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}