"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { X, Search } from "lucide-react";

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

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export default function SessionDetailModal({
  sesion,
  isAdmin,
  onClose,
  onChanged,
}: {
  sesion: Sesion;
  isAdmin: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [buscando, setBuscando] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [saving, setSaving] = useState(false);

  const manuales = sesion.sesion_reservas || [];
  const reales = (sesion.reservas || []).filter((r) => r.estado === "confirmada");
  const totalReservados = manuales.length + reales.length;
  const disponibles = sesion.capacidad - totalReservados;
  const porcentaje = Math.min(
    100,
    Math.round((totalReservados / sesion.capacidad) * 100)
  );

  const fechaLabel = new Date(sesion.fecha_hora).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
  const horaLabel = new Date(sesion.fecha_hora).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Cargar la lista de perfiles registrados al abrir el buscador
  useEffect(() => {
    if (buscando) {
      const fetchProfiles = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .order("full_name");
        setProfiles(data ?? []);
      };
      fetchProfiles();
    }
  }, [buscando]);

  const perfilesFiltrados = profiles.filter((p) =>
    (p.full_name || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.email || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleAgregarPerfil = async (nombrePerfil: string) => {
    if (!nombrePerfil.trim()) return;
    setSaving(true);
    await supabase.from("sesion_reservas").insert({
      sesion_id: sesion.id,
      nombre: nombrePerfil.trim(),
    });
    setSaving(false);
    setBuscando(false);
    setBusqueda("");
    onChanged();
  };

  const handleQuitar = async (reservaId: string) => {
    await supabase.from("sesion_reservas").delete().eq("id", reservaId);
    onChanged();
  };

  const handleCancelarSesion = async () => {
    if (!confirm("¿Cancelar esta sesión? Dejará de mostrarse en el calendario.")) return;
    await supabase.from("sesiones").update({ estado: "cancelada" }).eq("id", sesion.id);
    onChanged();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
              {sesion.disciplinas?.nombre || "Clase"}
            </span>
            <p className="text-sm text-gray-500 capitalize">
              {fechaLabel} · {horaLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#2C2421]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Instructor</span>
            <span className="font-medium text-[#2C2421]">
              {sesion.instructores?.nombre || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Duración</span>
            <span className="font-medium text-[#2C2421]">
              {sesion.duracion_min} min
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Ubicación</span>
            <span className="font-medium text-[#2C2421]">
              {sesion.ubicacion || "—"}
            </span>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Reservas</span>
              <span className="font-medium text-[#2C2421]">
                {totalReservados}/{sesion.capacidad}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <p className="text-xs text-green-600 font-medium mt-1.5">
              {disponibles} disponibles
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100">
            {isAdmin && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">Nombre de la reserva</span>
                <button
                  onClick={() => setBuscando(!buscando)}
                  className="text-xs font-semibold text-[#2C2421] border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50"
                >
                  {buscando ? "Cerrar" : "+ Agregar"}
                </button>
              </div>
            )}

            {/* Panel de búsqueda de cuentas registradas */}
            {buscando && isAdmin && (
              <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar cuenta registrada..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2C2421]"
                    autoFocus
                  />
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {perfilesFiltrados.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">No se encontraron cuentas.</p>
                  ) : (
                    perfilesFiltrados.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleAgregarPerfil(p.full_name || p.email || "Usuario")}
                        disabled={saving}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-colors flex flex-col border border-transparent hover:border-gray-200"
                      >
                        <span className="text-xs font-semibold text-[#2C2421]">
                          {p.full_name || "Sin nombre"}
                        </span>
                        <span className="text-[10px] text-gray-400">{p.email}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              {totalReservados === 0 ? (
                <p className="text-xs text-gray-400">Sin reservas todavía.</p>
              ) : (
                <>
                  {reales.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <span className="flex items-center gap-2 text-[#2C2421]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {r.cliente_nombre || "Cliente"}
                      </span>
                      <span className="text-[10px] font-semibold text-blue-500 uppercase">
                        En línea
                      </span>
                    </div>
                  ))}
                  {manuales.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <span className="flex items-center gap-2 text-[#2C2421]">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {r.nombre}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => handleQuitar(r.id)}
                          className="text-gray-300 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="px-6 pb-6">
            <button
              onClick={handleCancelarSesion}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm py-3 rounded-xl transition-colors"
            >
              Cancelar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}