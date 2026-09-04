"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { CalendarCheck, TrendingUp } from "lucide-react";

type Reserva = {
  id: string;
  clase: string;
  email: string | null;
};

export default function AdminDashboardPage() {
  const [totalReservas, setTotalReservas] = useState<number | null>(null);
  const [confirmadas, setConfirmadas] = useState<number | null>(null);
  const [recientes, setRecientes] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Ajusta los nombres de tabla/columnas a los tuyos reales
      const { count: total } = await supabase
        .from("reservas")
        .select("*", { count: "exact", head: true });

      const { count: confirmed } = await supabase
        .from("reservas")
        .select("*", { count: "exact", head: true })
        .eq("estado", "confirmada");

      const { data: recent } = await supabase
        .from("reservas")
        .select("id, clase, email")
        .order("created_at", { ascending: false })
        .limit(5);

      setTotalReservas(total ?? 0);
      setConfirmadas(confirmed ?? 0);
      setRecientes(recent ?? []);
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div>
      <h1 className="font-serif text-3xl text-[#2C2421] mb-1">Resumen</h1>
      <p className="text-sm text-gray-500 mb-8">
        Bienvenido al panel de administración
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="w-10 h-10 rounded-xl bg-[#2C2421]/10 flex items-center justify-center mb-4">
            <CalendarCheck className="w-5 h-5 text-[#2C2421]" />
          </div>
          <p className="text-2xl font-bold text-[#2C2421]">
            {loading ? "…" : totalReservas}
          </p>
          <p className="text-xs text-gray-500 mt-1">Reservas totales</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-[#2C2421]">
            {loading ? "…" : confirmadas}
          </p>
          <p className="text-xs text-gray-500 mt-1">Confirmadas</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#2C2421] text-sm">
            Reservas recientes
          </h2>
        </div>
        <div>
          {loading ? (
            <p className="px-6 py-6 text-sm text-gray-400">Cargando...</p>
          ) : recientes.length === 0 ? (
            <p className="px-6 py-6 text-sm text-gray-400">
              Sin reservas todavía.
            </p>
          ) : (
            recientes.map((r, i) => (
              <div
                key={r.id}
                className={`px-6 py-4 ${
                  i < recientes.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <p className="text-sm font-medium text-[#2C2421]">
                  {r.clase}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {r.email || r.id}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}