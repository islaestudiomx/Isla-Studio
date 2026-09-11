"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { Package, Calendar, CreditCard, Clock } from "lucide-react";

type CompraPaquete = {
  id: string;
  creditos_restantes: number;
  creditos_totales: number;
  fecha_vencimiento: string;
  paquetes: { nombre: string } | null;
};

type Reserva = {
  id: string;
  fecha_sesion: string;
  estado: string;
  disciplinas: { nombre: string } | null;
  instructores: { nombre: string } | null;
};

function horasHasta(fechaISO: string) {
  return (new Date(fechaISO).getTime() - Date.now()) / (1000 * 60 * 60);
}

export default function DashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [nombre, setNombre] = useState("");
  const [paquetes, setPaquetes] = useState<CompraPaquete[]>([]);
  const [proximasReservas, setProximasReservas] = useState<Reserva[]>([]);
  const [historial, setHistorial] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async (userId: string) => {
    setLoading(true);

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();
    setNombre(profile?.full_name || "");

    const { data: compras } = await supabase
      .from("compras_paquetes")
      .select(
        "id, creditos_restantes, creditos_totales, fecha_vencimiento, paquetes ( nombre )"
      )
      .eq("cliente_id", userId)
      .gt("creditos_restantes", 0)
      .gt("fecha_vencimiento", new Date().toISOString())
      .order("fecha_vencimiento", { ascending: true });
    setPaquetes((compras as any) ?? []);

    const ahora = new Date().toISOString();

    const { data: proximas } = await supabase
      .from("reservas")
      .select("id, fecha_sesion, estado, disciplinas ( nombre ), instructores ( nombre )")
      .eq("cliente_id", userId)
      .eq("estado", "confirmada")
      .gte("fecha_sesion", ahora)
      .order("fecha_sesion", { ascending: true });
    setProximasReservas((proximas as any) ?? []);

    const { data: pasadas } = await supabase
      .from("reservas")
      .select("id, fecha_sesion, estado, disciplinas ( nombre ), instructores ( nombre )")
      .eq("cliente_id", userId)
      .lt("fecha_sesion", ahora)
      .order("fecha_sesion", { ascending: false })
      .limit(10);
    setHistorial((pasadas as any) ?? []);

    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setChecking(false);
      fetchData(user.id);
    };

    init();
  }, [router, fetchData]);

  const handleCancelar = async (reservaId: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas cancelar esta reserva? Tu crédito será devuelto a tu paquete."
    );
    if (!confirmar) return;

    setActionLoading(reservaId);
    const { error } = await supabase.rpc("cancelar_reserva_cliente", {
      p_reserva_id: reservaId,
    });
    setActionLoading(null);

    if (error) {
      alert(error.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) fetchData(user.id);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EF]">
        <p className="text-sm text-gray-500">Cargando...</p>
      </div>
    );
  }

  const totalCreditos = paquetes.reduce((sum, p) => sum + p.creditos_restantes, 0);
  const proximaClase = proximasReservas[0] ?? null;

  return (
    <div className="min-h-screen bg-[#F5F2EF]">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-24 md:py-28">
        <h1 className="font-serif text-3xl md:text-4xl text-[#2C2421] mb-1">
          {nombre ? `Hola, ${nombre.split(" ")[0]}` : "Tu dashboard"}
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Aquí puedes ver tus créditos, paquetes y próximas reservas.
        </p>

        {loading ? (
          <p className="text-sm text-gray-400">Cargando...</p>
        ) : (
          <>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="w-10 h-10 rounded-xl bg-[#2C2421]/10 flex items-center justify-center mb-4">
                  <CreditCard className="w-5 h-5 text-[#2C2421]" />
                </div>
                <p className="text-2xl font-bold text-[#2C2421]">{totalCreditos}</p>
                <p className="text-xs text-gray-500 mt-1">Créditos disponibles</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="w-10 h-10 rounded-xl bg-[#2C2421]/10 flex items-center justify-center mb-4">
                  <Package className="w-5 h-5 text-[#2C2421]" />
                </div>
                <p className="text-2xl font-bold text-[#2C2421]">{paquetes.length}</p>
                <p className="text-xs text-gray-500 mt-1">Paquetes activos</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="w-10 h-10 rounded-xl bg-[#2C2421]/10 flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5 text-[#2C2421]" />
                </div>
                {proximaClase ? (
                  <>
                    <p className="text-sm font-bold text-[#2C2421]">
                      {proximaClase.disciplinas?.nombre}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(proximaClase.fecha_sesion).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-gray-400">Sin reservas</p>
                    <p className="text-xs text-gray-500 mt-1">Próxima clase</p>
                  </>
                )}
              </div>
            </div>

            {/* Paquetes activos */}
            <div className="mb-8">
              <h2 className="font-semibold text-[#2C2421] mb-3">Mis paquetes</h2>
              {paquetes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                  <p className="text-sm text-gray-500 mb-4">
                    No tienes paquetes activos en este momento.
                  </p>
                  <Link
                    href="/paquetes"
                    className="inline-block bg-[#2C2421] hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Ver paquetes disponibles
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paquetes.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-gray-100 p-5"
                    >
                      <p className="font-semibold text-[#2C2421] text-sm">
                        {p.paquetes?.nombre}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-2xl font-bold text-[#2C2421]">
                          {p.creditos_restantes}
                        </span>
                        <span className="text-xs text-gray-400">
                          de {p.creditos_totales} créditos
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${(p.creditos_restantes / p.creditos_totales) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Vence el{" "}
                        {new Date(p.fecha_vencimiento).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Próximas reservas */}
            <div className="mb-8">
              <h2 className="font-semibold text-[#2C2421] mb-3">Próximas reservas</h2>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {proximasReservas.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No tienes reservas próximas.
                  </p>
                ) : (
                  proximasReservas.map((r, i) => {
                    const canCancel = horasHasta(r.fecha_sesion) >= 8;
                    return (
                      <div
                        key={r.id}
                        className={`flex items-center justify-between px-6 py-4 ${
                          i < proximasReservas.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#2C2421]">
                            {r.disciplinas?.nombre}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {r.instructores?.nombre} ·{" "}
                            {new Date(r.fecha_sesion).toLocaleDateString("es-MX", {
                              weekday: "long",
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {canCancel ? (
                          <button
                            onClick={() => handleCancelar(r.id)}
                            disabled={actionLoading === r.id}
                            className="border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === r.id ? "Cancelando..." : "Cancelar"}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Fuera de tiempo para cancelar
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Historial */}
            <div>
              <h2 className="font-semibold text-[#2C2421] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Historial reciente
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {historial.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    Sin historial todavía.
                  </p>
                ) : (
                  historial.map((r, i) => (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between px-6 py-4 ${
                        i < historial.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-[#2C2421]">
                          {r.disciplinas?.nombre}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {r.instructores?.nombre} ·{" "}
                          {new Date(r.fecha_sesion).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          r.estado === "confirmada"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {r.estado === "confirmada" ? "Asistida" : "Cancelada"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}