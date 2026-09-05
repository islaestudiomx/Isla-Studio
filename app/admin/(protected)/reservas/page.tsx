"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

type Reserva = {
  id: string;
  estado: string;
  cliente_nombre: string | null;
  cliente_id: string | null;
  fecha_sesion: string | null;
  created_at: string;
  clase: string | null;
  profiles: { full_name: string | null } | null;
  instructores: { nombre: string } | null;
  tipos_clase: { nombre: string } | null;
};

const ESTADO_STYLES: Record<string, string> = {
  confirmada: "bg-green-100 text-green-700",
  pendiente: "bg-yellow-100 text-yellow-700",
  cancelada: "bg-red-100 text-red-700",
};

function formatFecha(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const dia = d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
  const hora = d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dia} · ${hora}`;
}

function formatFechaCorta(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("reservas")
        .select(
          `id, estado, cliente_nombre, cliente_id, fecha_sesion, created_at, clase,
           profiles ( full_name ),
           instructores ( nombre ),
           tipos_clase ( nombre )`
        )
        .order("created_at", { ascending: false });

      setReservas((data as any) ?? []);
      setLoading(false);
    };

    fetchReservas();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#2C2421]">Reservas</h1>
        <p className="text-sm text-gray-500 mt-1">Todas las reservas del sistema</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Usuario
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Clase
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Instructor
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Fecha sesión
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Reservado
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Cargando...
                </td>
              </tr>
            ) : reservas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No hay reservas todavía.
                </td>
              </tr>
            ) : (
              reservas.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#2C2421]">
                      {r.profiles?.full_name || r.cliente_nombre || "—"}
                    </p>
                    {r.cliente_id && (
                      <p className="text-xs text-gray-400">
                        ID: {r.cliente_id.slice(0, 8)}...
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#2C2421]">
                    {r.tipos_clase?.nombre || r.clase || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {r.instructores?.nombre || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatFecha(r.fecha_sesion)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatFechaCorta(r.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        ESTADO_STYLES[r.estado] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}