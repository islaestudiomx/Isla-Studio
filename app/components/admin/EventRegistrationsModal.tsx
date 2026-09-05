"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { X } from "lucide-react";

type Registro = {
  id: string;
  nombre: string | null;
  email: string | null;
  monto_pagado: number;
  created_at: string;
};

export default function EventRegistrationsModal({
  eventoId,
  eventoTitulo,
  onClose,
}: {
  eventoId: string;
  eventoTitulo: string;
  onClose: () => void;
}) {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistros = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("eventos_registros")
        .select("id, nombre, email, monto_pagado, created_at")
        .eq("evento_id", eventoId)
        .order("created_at", { ascending: false });
      setRegistros(data ?? []);
      setLoading(false);
    };

    fetchRegistros();
  }, [eventoId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-xl text-[#2C2421]">Registrados</h2>
            <p className="text-sm text-gray-500 mt-0.5">{eventoTitulo}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#2C2421]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-2">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
          ) : registros.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Nadie se ha registrado todavía.
            </p>
          ) : (
            registros.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[#2C2421]">
                    {r.nombre || "Sin nombre"}
                  </p>
                  {r.email && (
                    <p className="text-xs text-gray-400">{r.email}</p>
                  )}
                </div>
                <p className="text-sm font-medium text-[#2C2421]">
                  ${r.monto_pagado.toLocaleString("es-MX")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}