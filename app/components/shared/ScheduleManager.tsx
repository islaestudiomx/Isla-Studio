"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { ChevronLeft, ChevronRight, Plus, LogOut } from "lucide-react";
import NewSessionModal from "../instructores/NewSessionModal";
import SessionDetailModal from "../instructores/SessionDetailModal";

type Sesion = {
  id: string;
  fecha_hora: string;
  duracion_min: number;
  capacidad: number;
  ubicacion: string | null;
  disciplinas: { nombre: string } | null;
  instructores: { nombre: string } | null;
  sesion_reservas: { id: string; nombre: string }[];
  reservas: { id: string; cliente_nombre: string | null; estado: string }[];
};

type Disciplina = { id: string; nombre: string };
type Instructor = { id: string; nombre: string };

const COLORES = [
  { border: "border-l-green-500", bg: "bg-green-50" },
  { border: "border-l-blue-500", bg: "bg-blue-50" },
  { border: "border-l-pink-500", bg: "bg-pink-50" },
];

function inicioDelDia(d: Date) {
  const copia = new Date(d);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function totalOcupado(s: Sesion) {
  const manuales = s.sesion_reservas?.length ?? 0;
  const reales = (s.reservas ?? []).filter((r) => r.estado === "confirmada").length;
  return manuales + reales;
}

export default function ScheduleManager({
  isAdmin,
  subtitulo,
  onLogout,
}: {
  isAdmin: boolean;
  subtitulo: string;
  onLogout?: () => void;
}) {
  const [fecha, setFecha] = useState(() => inicioDelDia(new Date()));
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSession, setShowNewSession] = useState(false);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<Sesion | null>(
    null
  );

  const fetchSesiones = useCallback(async () => {
    setLoading(true);
    const inicio = inicioDelDia(fecha);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 1);

    const { data } = await supabase
      .from("sesiones")
      .select(
        `id, fecha_hora, duracion_min, capacidad, ubicacion,
         disciplinas ( nombre ),
         instructores ( nombre ),
         sesion_reservas ( id, nombre ),
         reservas ( id, cliente_nombre, estado )`
      )
      .eq("estado", "activa")
      .gte("fecha_hora", inicio.toISOString())
      .lt("fecha_hora", fin.toISOString())
      .order("fecha_hora", { ascending: true });

    setSesiones((data as any) ?? []);
    setLoading(false);
  }, [fecha]);

  useEffect(() => {
    fetchSesiones();
  }, [fetchSesiones]);

  useEffect(() => {
    const fetchFormOptions = async () => {
      const [{ data: disc }, { data: instr }] = await Promise.all([
        supabase.from("disciplinas").select("id, nombre").order("nombre"),
        supabase.from("instructores").select("id, nombre").order("nombre"),
      ]);
      setDisciplinas(disc ?? []);
      setInstructores(instr ?? []);
    };

    fetchFormOptions();
  }, []);

  const cambiarDia = (delta: number) => {
    const nueva = new Date(fecha);
    nueva.setDate(nueva.getDate() + delta);
    setFecha(inicioDelDia(nueva));
  };

  const mesLabel = fecha.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });
  const diaCorto = fecha.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const diaLargo = fecha.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-[#2C2421]">Horarios</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitulo}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewSession(true)}
            className="flex items-center gap-2 bg-[#2C2421] hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva clase
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 border border-gray-200 text-sm font-medium text-gray-600 px-4 py-2.5 rounded-xl hover:bg-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-sm">
            <span className="font-semibold text-[#2C2421] capitalize">
              {mesLabel}
            </span>
            <span className="text-gray-400"> — {diaCorto}</span>
          </p>
          <button
            onClick={() => setFecha(inicioDelDia(new Date()))}
            className="text-xs font-semibold text-[#2C2421] border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50"
          >
            Hoy
          </button>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button
            onClick={() => cambiarDia(-1)}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-semibold text-[#2C2421] capitalize">
            {diaLargo}
          </p>
          <button
            onClick={() => cambiarDia(1)}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-16">
              Cargando...
            </p>
          ) : sesiones.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-400 mb-4">
                No hay clases programadas para este día
              </p>
              <button
                onClick={() => setShowNewSession(true)}
                className="bg-[#2C2421] hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                + Agregar clase
              </button>
            </div>
          ) : (
            sesiones.map((s, i) => {
              const color = COLORES[i % COLORES.length];
              const ocupados = totalOcupado(s);
              const disponibles = s.capacidad - ocupados;
              return (
                <button
                  key={s.id}
                  onClick={() => setSesionSeleccionada(s)}
                  className={`w-full flex items-center justify-between px-6 py-4 border-l-4 ${color.border} ${color.bg} border-b border-gray-100 last:border-b-0 hover:brightness-95 transition-all text-left`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 shrink-0">
                      <p className="text-sm font-bold text-[#2C2421]">
                        {new Date(s.fecha_hora).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {s.duracion_min} min
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2C2421]">
                        {s.disciplinas?.nombre || "Clase"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.instructores?.nombre || "—"} · {s.ubicacion}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#2C2421]">
                      {ocupados}/{s.capacidad}
                    </p>
                    <p className="text-xs text-green-600">
                      {disponibles} disponibles
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {showNewSession && (
        <NewSessionModal
          fechaBase={fecha}
          disciplinas={disciplinas}
          instructores={instructores}
          onClose={() => setShowNewSession(false)}
          onCreated={() => {
            setShowNewSession(false);
            fetchSesiones();
          }}
        />
      )}

      {sesionSeleccionada && (
        <SessionDetailModal
          sesion={sesionSeleccionada}
          isAdmin={isAdmin}
          onClose={() => setSesionSeleccionada(null)}
          onChanged={fetchSesiones}
        />
      )}
    </div>
  );
}