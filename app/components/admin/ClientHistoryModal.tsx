"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { X } from "lucide-react";

type ReservaHistorial = {
  id: string;
  clase: string | null;
  estado: string;
  fecha_sesion: string | null;
  created_at: string;
  compras_paquetes: { paquete_nombre: string } | null;
  tipos_clase: { nombre: string } | null;
};

const ESTADO_STYLES: Record<string, string> = {
  confirmada: "bg-green-100 text-green-700",
  pendiente: "bg-yellow-100 text-yellow-700",
  cancelada: "bg-red-100 text-red-700",
};

export default function ClientHistoryModal({
  clienteId,
  clienteNombre,
  onClose,
}: {
  clienteId: string;
  clienteNombre: string;
  onClose: () => void;
}) {
  const [reservas, setReservas] = useState<ReservaHistorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("reservas")
        .select(
          `id, clase, estado, fecha_sesion, created_at,
           compras_paquetes ( paquete_nombre ),
           tipos_clase ( nombre )`
        )
        .eq("cliente_id", clienteId)
        .order("fecha_sesion", { ascending: false });

      setReservas((data as any) ?? []);
      setLoading(false);
    };

    fetchReservas();
  }, [clienteId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-xl text-[#2C2421]">
              Historial de reservas
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{clienteNombre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#2C2421]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
          ) : reservas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Este cliente no tiene reservas todavía.
            </p>
          ) : (
            reservas.map((r) => (
              <div
                key={r.id}
                className="border border-gray-100 rounded-xl px-4 py-3 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[#2C2421]">
                    {r.tipos_clase?.nombre || r.clase || "—"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {r.fecha_sesion
                      ? new Date(r.fecha_sesion).toLocaleString("es-MX", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Sin fecha"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      ESTADO_STYLES[r.estado] || "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {r.estado}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-100">
                    {r.compras_paquetes?.paquete_nombre || "Sin paquete asociado"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}