"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { ChevronDown, ChevronUp, X, MessageCircle } from "lucide-react";

type Paquete = {
  id: string;
  nombre: string;
  vigencia_dias: number;
  num_clases: number;
  precio: number;
  activo: boolean;
  disciplina_id: string | null;
};

export default function ClientPaquetesPage() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPaquete, setSelectedPaquete] = useState<Paquete | null>(null);

  const fetchPaquetes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("paquetes")
      .select("*")
      .order("precio", { ascending: true });

    if (error) {
      console.error("Error cargando paquetes:", error.message);
    }

    setPaquetes(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPaquetes();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleWhatsApp = (paquete: Paquete) => {
    const mensaje = encodeURIComponent(
      `Hola! Me interesa comprar el paquete *${paquete.nombre}* (${paquete.num_clases} clases) por $${paquete.precio ?? 0} MXN. Adjunto mi comprobante.`
    );
    window.open(`https://wa.me/529671331701?text=${mensaje}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F5F2EF] pt-28 pb-12 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-[#2C2421] tracking-wide mb-2">
            Paquetes
          </h1>
          <p className="text-sm text-[#2C2421]/60">
            Elige el paquete ideal para tu entrenamiento en el estudio.
          </p>
        </div>

        {/* Lista de Paquetes */}
        {loading ? (
          <p className="text-sm text-[#2C2421]/50 text-center py-20">
            Cargando paquetes disponibles...
          </p>
        ) : paquetes.length === 0 ? (
          <p className="text-sm text-[#2C2421]/50 text-center py-20">
            No hay paquetes disponibles por el momento.
          </p>
        ) : (
          <div className="space-y-4">
            {paquetes.map((paquete) => {
              const isExpanded = expandedId === paquete.id;
              const precioVal = paquete.precio ?? 0;
              return (
                <div
                  key={paquete.id}
                  className="bg-white rounded-2xl border border-[#2C2421]/10 shadow-sm overflow-hidden transition-all"
                >
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-serif text-lg text-[#2C2421]">
                          {paquete.nombre}
                        </h3>
                      </div>

                      <button
                        onClick={() => toggleExpand(paquete.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#2C2421]/70 hover:text-[#2C2421] mt-2 transition-colors"
                      >
                        <span>Incluye</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <span className="font-serif text-xl font-bold text-[#2C2421]">
                        ${precioVal.toLocaleString("es-MX")} <span className="text-xs font-sans font-normal text-gray-400">MXN</span>
                      </span>

                      {/* Botón con los colores del panel admin (#2C2421 y hover negro) */}
                      <button
                        onClick={() => setSelectedPaquete(paquete)}
                        className="bg-[#2C2421] hover:bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>

                  {/* Acordeón de detalles */}
                  {isExpanded && (
                    <div className="bg-[#F5F2EF]/50 px-6 py-4 border-t border-[#2C2421]/5 text-xs text-[#2C2421]/70 space-y-1">
                      <p>• {paquete.num_clases} {paquete.num_clases === 1 ? "clase disponible" : "clases disponibles"}.</p>
                      <p>• Vigencia de {paquete.vigencia_dias} días a partir de tu primera reserva.</p>
                      <p>• Acceso exclusivo a clases presenciales en el estudio.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Pago / Transferencia */}
      {selectedPaquete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 relative shadow-2xl">
            <button
              onClick={() => setSelectedPaquete(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-[#2C2421] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl text-[#2C2421] mb-1">
                ¡Tu reserva casi queda hecha!
              </h2>
              <p className="text-xs text-[#2C2421]/60">
                Estás comprando: <span className="font-semibold text-[#2C2421]">{selectedPaquete.nombre}</span> por ${(selectedPaquete.precio ?? 0).toLocaleString("es-MX")} MXN.
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
                onClick={() => handleWhatsApp(selectedPaquete)}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-sm text-sm"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar comprobante a WhatsApp
              </button>
              <button
                onClick={() => setSelectedPaquete(null)}
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