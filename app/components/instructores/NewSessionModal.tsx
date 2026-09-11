"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { X } from "lucide-react";

type Disciplina = { id: string; nombre: string };
type Instructor = { id: string; nombre: string };

export default function NewSessionModal({
  fechaBase,
  disciplinas,
  instructores,
  onClose,
  onCreated,
}: {
  fechaBase: Date;
  disciplinas: Disciplina[];
  instructores: Instructor[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [disciplinaId, setDisciplinaId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [duracion, setDuracion] = useState("50");
  const [capacidad, setCapacidad] = useState("15");
  const [ubicacion, setUbicacion] = useState("Isla Studio");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!disciplinaId || !instructorId || !fechaHora) {
      setError("Clase, instructor y fecha son obligatorios.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("sesiones").insert({
      disciplina_id: disciplinaId,
      instructor_id: instructorId,
      fecha_hora: new Date(fechaHora).toISOString(),
      duracion_min: parseInt(duracion, 10) || 50,
      capacidad: parseInt(capacidad, 10),
      ubicacion: ubicacion.trim() || "Isla Studio",
      estado: "activa",
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[#2C2421] text-lg">Nueva sesión</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#2C2421]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Clase <span className="text-red-400">*</span>
              </label>
              <select
                value={disciplinaId}
                onChange={(e) => setDisciplinaId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              >
                <option value="">Seleccionar...</option>
                {disciplinas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Instructor <span className="text-red-400">*</span>
              </label>
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              >
                <option value="">Seleccionar...</option>
                {instructores.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Fecha y hora <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Duración (min)
              </label>
              <input
                type="number"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Capacidad
              </label>
              <input
                type="number"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
              Ubicación
            </label>
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#2C2421] hover:bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? "Creando..." : "Crear sesión"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-[#2C2421] font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}