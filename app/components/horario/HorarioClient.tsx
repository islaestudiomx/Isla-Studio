"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/utils/supabase";
import BookingModal from "./BookingModal";

type Sesion = {
  id: string;
  fecha_hora: string;
  duracion_min: number;
  capacidad: number;
  ubicacion: string | null;
  disciplina_id: string | null;
  instructor_id: string | null;
  disciplinas: { id: string; nombre: string; imagen_url: string | null } | null;
  instructores: { nombre: string } | null;
  espacios_disponibles: number;
};

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function inicioDeSemana(d: Date) {
  const copia = new Date(d);
  const dia = copia.getDay();
  const offset = dia === 0 ? -6 : 1 - dia;
  copia.setDate(copia.getDate() + offset);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function sumarDias(d: Date, n: number) {
  const copia = new Date(d);
  copia.setDate(copia.getDate() + n);
  return copia;
}

function esMismoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function horasHasta(fechaISO: string) {
  return (new Date(fechaISO).getTime() - Date.now()) / (1000 * 60 * 60);
}

export default function HorarioClient() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [weekStart, setWeekStart] = useState(() => inicioDeSemana(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [reservadasIds, setReservadasIds] = useState<Set<string>>(new Set());
  const [misReservas, setMisReservas] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSesion, setSelectedSesion] = useState<Sesion | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkUser();
  }, []);

  const fetchSesiones = useCallback(async () => {
    setLoading(true);

    const desde = sumarDias(new Date(), -30).toISOString();
    const hasta = sumarDias(new Date(), 60).toISOString();

    const { data: sesionesRaw } = await supabase
      .from("sesiones")
      .select(
        `id, fecha_hora, duracion_min, capacidad, ubicacion, disciplina_id, instructor_id,
         disciplinas ( id, nombre, imagen_url ),
         instructores ( nombre )`
      )
      .eq("estado", "activa")
      .gte("fecha_hora", desde)
      .lte("fecha_hora", hasta)
      .order("fecha_hora", { ascending: true });

    const lista = (sesionesRaw as any) ?? [];
    const ids = lista.map((s: any) => s.id);

    let conteos: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: counts } = await supabase.rpc("contar_reservas_confirmadas", {
        p_sesion_ids: ids,
      });
      (counts ?? []).forEach((c: any) => {
        conteos[c.sesion_id] = Number(c.total);
      });
    }

    const conDisponibilidad = lista.map((s: any) => ({
      ...s,
      espacios_disponibles: Math.max(0, s.capacidad - (conteos[s.id] || 0)),
    }));

    setSesiones(conDisponibilidad);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && ids.length > 0) {
      const { data: reservas } = await supabase
        .from("reservas")
        .select("id, sesion_id")
        .eq("cliente_id", user.id)
        .eq("estado", "confirmada")
        .in("sesion_id", ids);

      const set = new Set<string>();
      const map: Record<string, string> = {};
      (reservas ?? []).forEach((r: any) => {
        set.add(r.sesion_id);
        map[r.sesion_id] = r.id;
      });
      setReservadasIds(set);
      setMisReservas(map);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSesiones();
  }, [fetchSesiones]);

  const sesionesDelDia = sesiones.filter((s) =>
    esMismoDia(new Date(s.fecha_hora), selectedDay)
  );

  const mesLabel = weekStart
    .toLocaleDateString("es-MX", { month: "long", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase());

  const diaLabel = selectedDay.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleReservarClick = (sesion: Sesion) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setSelectedSesion(sesion);
  };

  const handleCancelar = async (reservaId: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas cancelar esta reserva? Tu crédito será devuelto a tu paquete."
    );
    if (!confirmar) return;

    setActionLoading(true);
    const { error } = await supabase.rpc("cancelar_reserva_cliente", {
      p_reserva_id: reservaId,
    });
    setActionLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Reserva cancelada con éxito. El crédito ha sido devuelto a tu paquete.");
    fetchSesiones();
  };

  return (
    <section className="w-full bg-[#F5F2EF] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-24 md:py-28">
        <h1 className="font-serif text-3xl md:text-4xl text-[#2C2421] mb-6">Horario</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-[#2C2421] capitalize">{mesLabel}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekStart((w) => sumarDias(w, -7))}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => {
                  const hoy = new Date();
                  setWeekStart(inicioDeSemana(hoy));
                  setSelectedDay(hoy);
                }}
                className="px-4 py-1.5 text-xs md:text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hoy
              </button>
              <button
                onClick={() => setWeekStart((w) => sumarDias(w, 7))}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7">
            {DIAS_SEMANA.map((label, i) => {
              const dia = sumarDias(weekStart, i);
              const seleccionado = esMismoDia(dia, selectedDay);
              const esHoy = esMismoDia(dia, new Date());
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(dia)}
                  className={`flex flex-col items-center py-3 md:py-4 border-r last:border-r-0 border-gray-100 transition-colors ${
                    seleccionado ? "bg-[#2C2421] text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-[10px] md:text-xs font-medium mb-1">{label}</span>
                  <span
                    className={`text-base md:text-lg font-bold leading-none ${
                      seleccionado ? "text-white" : esHoy ? "text-[#2C2421]" : ""
                    }`}
                  >
                    {dia.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl px-4 py-2 mb-4 text-sm text-gray-600 font-medium capitalize">
          {diaLabel}
        </div>

        <div className="flex flex-col gap-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Cargando...</div>
          ) : sesionesDelDia.length === 0 ? (
            <div className="py-12 md:py-16 text-center text-gray-400 text-sm">
              No hay clases programadas para este día.
            </div>
          ) : (
            sesionesDelDia.map((sesion, i) => {
              const disponibles = sesion.espacios_disponibles;
              const isFull = disponibles <= 0;
              const isLow = disponibles > 0 && disponibles <= 3;
              const reservaId = misReservas[sesion.id];
              const isBooked = reservadasIds.has(sesion.id);

              const horas = horasHasta(sesion.fecha_hora);
              const isPast = horas <= 0;
              const canBook = horas >= 2;
              const canCancel = horas >= 8;

              return (
                <div
                  key={sesion.id}
                  className={`flex items-center gap-3 md:gap-6 px-4 md:px-6 py-4 md:py-5 ${
                    i < sesionesDelDia.length - 1 ? "border-b border-gray-100" : ""
                  } ${isPast && !isBooked ? "opacity-60" : ""}`}
                >
                  <div className="w-16 md:w-20 shrink-0">
                    <p className="font-bold text-[#2C2421] text-sm md:text-base">
                      {new Date(sesion.fecha_hora).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{sesion.duracion_min} mins</p>
                  </div>

                  <div className="hidden md:block w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    {sesion.disciplinas?.imagen_url ? (
                      <img
                        src={sesion.disciplinas.imagen_url}
                        alt={sesion.disciplinas.nombre}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#2C2421] text-sm md:text-base mb-0.5 truncate">
                      {sesion.disciplinas?.nombre}
                    </p>
                    <p className="text-gray-600 text-xs md:text-sm truncate">
                      {sesion.instructores?.nombre}
                    </p>
                    <p className="text-gray-400 text-xs truncate">{sesion.ubicacion}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 md:gap-2 shrink-0">
                    {isBooked ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-green-600 text-xs font-semibold">✓ Reservada</span>
                        {canCancel ? (
                          <button
                            onClick={() => reservaId && handleCancelar(reservaId)}
                            disabled={actionLoading}
                            className="border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 px-3 md:px-5 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-colors"
                          >
                            Cancelar clase
                          </button>
                        ) : (
                          <>
                            <button
                              disabled
                              className="border border-gray-200 text-gray-400 bg-gray-50 px-3 md:px-5 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium cursor-default"
                            >
                              Ya reservada
                            </button>
                            <span className="text-gray-400 text-[10px]">
                              Fuera de tiempo para cancelar
                            </span>
                          </>
                        )}
                      </div>
                    ) : isPast ? (
                      <button
                        disabled
                        className="border border-gray-200 text-gray-400 bg-gray-50 px-3 md:px-5 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium cursor-default"
                      >
                        Clase finalizada
                      </button>
                    ) : !canBook ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-orange-500 text-xs font-semibold">Cerrada</span>
                        <button
                          disabled
                          className="border border-gray-200 text-gray-400 bg-gray-50 px-3 md:px-5 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium cursor-default"
                        >
                          Reservas cerradas
                        </button>
                      </div>
                    ) : isFull ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-red-500 text-xs font-semibold">Sin espacios</span>
                        <button
                          disabled
                          className="border border-red-200 text-red-400 bg-red-50 px-3 md:px-5 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium cursor-default"
                        >
                          Clase llena
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        {isLow && (
                          <span className="text-orange-500 text-xs font-semibold">
                            {disponibles} {disponibles === 1 ? "espacio" : "espacios"}
                          </span>
                        )}
                        <button
                          onClick={() => handleReservarClick(sesion)}
                          className="border border-[#2C2421] text-[#2C2421] hover:bg-[#2C2421] hover:text-white transition-colors px-3 md:px-6 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap"
                        >
                          {isLoggedIn ? "Reservar" : "Iniciar sesión"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedSesion && (
        <BookingModal
          sesion={selectedSesion}
          onClose={() => setSelectedSesion(null)}
          onReserved={fetchSesiones}
        />
      )}
    </section>
  );
}