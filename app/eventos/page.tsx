"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Calendar, MapPin, X, MessageCircle, CheckCircle2 } from "lucide-react";

type Evento = {
  id: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  ubicacion: string | null;
  precio_regular: number;
  imagen_url: string | null;
  descripcion: string | null;
  estado: string;
};

function formatRango(inicio: string, fin: string | null) {
  const d1 = new Date(inicio);
  const fechaStr = d1.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  const horaInicio = d1.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  if (!fin) return `${fechaStr} · ${horaInicio}`;
  const horaFin = new Date(fin).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  return `${fechaStr} · ${horaInicio} → ${horaFin}`;
}

export default function ClientEventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [registradosIds, setRegistradosIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);

  const fetchEventos = async () => {
    setLoading(true);
    
    // 1. Obtener eventos activos
    const { data: eventosData } = await supabase
      .from("eventos")
      .select("*")
      .eq("estado", "activo")
      .order("fecha_inicio", { ascending: true });

    setEventos(eventosData ?? []);

    // 2. Obtener el usuario actual y verificar sus registros en eventos
    const { data: { user } } = await supabase.auth.getUser();
    if (user && eventosData && eventosData.length > 0) {
      const { data: regsData } = await supabase
        .from("eventos_registros")
        .select("evento_id")
        .eq("cliente_id", user.id);

      const idsInscritos = new Set<string>();
      (regsData ?? []).forEach((r) => {
        if (r.evento_id) idsInscritos.add(r.evento_id);
      });
      setRegistradosIds(idsInscritos);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleWhatsApp = (evento: Evento) => {
    const mensaje = encodeURIComponent(
      `Hola! Me interesa registrarme al evento *${evento.titulo}* por $${evento.precio_regular ?? 0} MXN. Adjunto mi comprobante de transferencia.`
    );
    window.open(`https://wa.me/529671331701?text=${mensaje}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F5F2EF] pt-28 pb-12 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-[#2C2421] tracking-wide mb-2">
            Eventos y Talleres
          </h1>
          <p className="text-sm text-[#2C2421]/60">
            Explora nuestros próximos eventos especiales y asegura tu lugar.
          </p>
        </div>

        {/* Lista de Eventos */}
        {loading ? (
          <p className="text-sm text-[#2C2421]/50 text-center py-20">
            Cargando eventos disponibles...
          </p>
        ) : eventos.length === 0 ? (
          <p className="text-sm text-[#2C2421]/50 text-center py-20">
            No hay eventos programados por el momento.
          </p>
        ) : (
          <div className="space-y-6">
            {eventos.map((evento) => {
              const precioVal = evento.precio_regular ?? 0;
              const yaRegistrado = registradosIds.has(evento.id);

              return (
                <div
                  key={evento.id}
                  className="bg-white rounded-2xl border border-[#2C2421]/10 shadow-sm overflow-hidden transition-all flex flex-col md:flex-row"
                >
                  {evento.imagen_url && (
                    <div className="md:w-72 h-48 md:h-auto bg-gray-100 shrink-0">
                      <img
                        src={evento.imagen_url}
                        alt={evento.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#2C2421]/60 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatRango(evento.fecha_inicio, evento.fecha_fin)}</span>
                      </div>

                      <h3 className="font-serif text-xl text-[#2C2421] mb-2">
                        {evento.titulo}
                      </h3>

                      {evento.ubicacion && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{evento.ubicacion}</span>
                        </div>
                      )}

                      {evento.descripcion && (
                        <p className="text-xs text-[#2C2421]/70 leading-relaxed mb-4">
                          {evento.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="font-serif text-xl font-bold text-[#2C2421]">
                        ${precioVal.toLocaleString("es-MX")} <span className="text-xs font-sans font-normal text-gray-400">MXN</span>
                      </span>

                      {yaRegistrado ? (
                        <div className="flex items-center gap-1.5 text-green-600 font-semibold text-sm bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Ya estás registrado</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedEvento(evento)}
                          className="bg-[#2C2421] hover:bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                        >
                          Registrarse
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Pago / Transferencia */}
      {selectedEvento && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 relative shadow-2xl">
            <button
              onClick={() => setSelectedEvento(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-[#2C2421] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl text-[#2C2421] mb-1">
                ¡Tu registro casi queda hecho!
              </h2>
              <p className="text-xs text-[#2C2421]/60">
                Te estás inscribiendo a: <span className="font-semibold text-[#2C2421]">{selectedEvento.titulo}</span> por ${(selectedEvento.precio_regular ?? 0).toLocaleString("es-MX")} MXN.
              </p>
            </div>

            <p className="text-xs font-medium text-[#2C2421]/70 mb-3 text-center">
              Haz el pago a este número de cuenta para finalizar:
            </p>

            {/* Tarjeta de datos bancarios */}
            <div className="bg-[#F5F2EF] rounded-2xl p-5 border border-[#2C2421]/10 space-y-3 mb-6 text-sm">
              <div className="flex justify-between items-center border-b border-[#2C2421]/5 pb-2">
                <span className="text-xs font-semibold text-[#2C2421]/50 uppercase">Banco:</span>
                <span className="font-bold text-[#2C2421]">BBVA</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#2C2421]/5 pb-2">
                <span className="text-xs font-semibold text-[#2C2421]/50 uppercase">Titular:</span>
                <span className="font-semibold text-[#2C2421]">Martha Paola Vargas Paniagua</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#2C2421]/5 pb-2">
                <span className="text-xs font-semibold text-[#2C2421]/50 uppercase">No. De Tarjeta:</span>
                <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">4152 3144 5881 1406</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#2C2421]/50 uppercase">Cuenta Clabe:</span>
                <span className="font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded font-medium">012 180 01543356522 2</span>
              </div>
            </div>

            {/* Nota de advertencia */}
            <div className="bg-[#FFFBEB] border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 mb-6 leading-relaxed">
              Manda tu comprobante por WhatsApp y <strong className="font-semibold">anota tu nombre y apellido</strong> en el concepto o referencia a la hora de hacer la transferencia.
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <button
                onClick={() => handleWhatsApp(selectedEvento)}
                className="w-full bg-[#22C55E] hover:bg-green-600 text-white font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-sm text-sm"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar comprobante a WhatsApp
              </button>
              <button
                onClick={() => setSelectedEvento(null)}
                className="w-full bg-transparent hover:bg-gray-50 text-[#2C2421] font-medium py-3 px-6 rounded-2xl border border-gray-200 transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}