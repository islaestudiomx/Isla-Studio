"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

type Metricas = {
  sesionesCreadas: number;
  sesionesActivas: number;
  totalReservas: number;
  confirmadas: number;
  canceladas: number;
};

export default function ReportesPage() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetricas = async () => {
      setLoading(true);

      const [
        { count: sesionesCreadas },
        { count: sesionesActivas },
        { count: totalReservas },
        { count: confirmadas },
        { count: canceladas },
      ] = await Promise.all([
        supabase.from("horarios").select("*", { count: "exact", head: true }),
        supabase
          .from("horarios")
          .select("*", { count: "exact", head: true })
          .eq("activo", true),
        supabase.from("reservas").select("*", { count: "exact", head: true }),
        supabase
          .from("reservas")
          .select("*", { count: "exact", head: true })
          .eq("estado", "confirmada"),
        supabase
          .from("reservas")
          .select("*", { count: "exact", head: true })
          .eq("estado", "cancelada"),
      ]);

      setMetricas({
        sesionesCreadas: sesionesCreadas ?? 0,
        sesionesActivas: sesionesActivas ?? 0,
        totalReservas: totalReservas ?? 0,
        confirmadas: confirmadas ?? 0,
        canceladas: canceladas ?? 0,
      });
      setLoading(false);
    };

    fetchMetricas();
  }, []);

  const tasaConfirmacion =
    metricas && metricas.totalReservas > 0
      ? Math.round((metricas.confirmadas / metricas.totalReservas) * 100)
      : 0;

  const tarjetas = metricas
    ? [
        { valor: metricas.sesionesCreadas, label: "Sesiones creadas" },
        { valor: metricas.sesionesActivas, label: "Sesiones activas" },
        { valor: metricas.totalReservas, label: "Total reservas" },
        { valor: metricas.confirmadas, label: "Confirmadas" },
        { valor: metricas.canceladas, label: "Canceladas" },
        { valor: `${tasaConfirmacion}%`, label: "Tasa de confirmación" },
      ]
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#2C2421]">Reportes</h1>
        <p className="text-sm text-gray-500 mt-1">Métricas generales del negocio</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tarjetas.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <p className="text-3xl font-bold text-[#2C2421]">{t.valor}</p>
              <p className="text-sm text-gray-500 mt-1">{t.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}