"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Plus, Users, Trash2 } from "lucide-react";
import ImageUpload from "@/app/components/admin/ImageUpload";
import EventRegistrationsModal from "@/app/components/admin/EventRegistrationsModal";

type Evento = {
  id: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  ubicacion: string | null;
  precio_regular: number;
  creditos_otorgados: number;
  imagen_url: string | null;
  estado: string;
};

function formatRango(inicio: string, fin: string | null) {
  const d1 = new Date(inicio);
  const fechaStr = d1.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  const horaInicio = d1.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  if (!fin) return `${fechaStr} · ${horaInicio}`;
  const horaFin = new Date(fin).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  return `${fechaStr} · ${horaInicio} → ${horaFin}`;
}

export default function EventosPage() {
  const [items, setItems] = useState<Evento[]>([]);
  const [conteos, setConteos] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [modalEvento, setModalEvento] = useState<Evento | null>(null);

  const [titulo, setTitulo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [ubicacion, setUbicacion] = useState("Isla Studio");
  const [capacidad, setCapacidad] = useState("");
  const [precioRegular, setPrecioRegular] = useState("");
  const [precioMiembros, setPrecioMiembros] = useState("");
  const [limiteMiembros, setLimiteMiembros] = useState("");
  const [creditos, setCreditos] = useState("");
  const [diasValidez, setDiasValidez] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const { data: eventosData } = await supabase
      .from("eventos")
      .select("*")
      .order("fecha_inicio", { ascending: false });

    setItems(eventosData ?? []);

    if (eventosData && eventosData.length > 0) {
      const { data: registros } = await supabase
        .from("eventos_registros")
        .select("evento_id");

      const counts: Record<string, number> = {};
      (registros ?? []).forEach((r) => {
        counts[r.evento_id] = (counts[r.evento_id] || 0) + 1;
      });
      setConteos(counts);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setTitulo("");
    setFechaInicio("");
    setFechaFin("");
    setUbicacion("Isla Studio");
    setCapacidad("");
    setPrecioRegular("");
    setPrecioMiembros("");
    setLimiteMiembros("");
    setCreditos("");
    setDiasValidez("");
    setImagenUrl("");
    setDescripcion("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!titulo.trim() || !fechaInicio) {
      setError("Título y fecha de inicio son obligatorios.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("eventos").insert({
      titulo: titulo.trim(),
      fecha_inicio: new Date(fechaInicio).toISOString(),
      fecha_fin: fechaFin ? new Date(fechaFin).toISOString() : null,
      ubicacion: ubicacion.trim() || null,
      capacidad: capacidad ? parseInt(capacidad, 10) : null,
      precio_regular: precioRegular ? parseFloat(precioRegular) : 0,
      precio_miembros_k: precioMiembros ? parseFloat(precioMiembros) : null,
      limite_miembros_k: limiteMiembros ? new Date(limiteMiembros).toISOString() : null,
      creditos_otorgados: creditos ? parseInt(creditos, 10) : 0,
      dias_validez: diasValidez ? parseInt(diasValidez, 10) : null,
      imagen_url: imagenUrl || null,
      descripcion: descripcion.trim() || null,
      estado: "activo",
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    resetForm();
    setShowForm(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este evento? También se borrarán sus registros.")) return;
    await supabase.from("eventos").delete().eq("id", id);
    fetchAll();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#2C2421]">Eventos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra tus talleres y ve quién se ha registrado
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#2C2421] hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo evento
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 p-6 mb-8"
        >
          <h2 className="font-semibold text-[#2C2421] mb-5">Nuevo evento</h2>

          <div className="mb-5">
            <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
              Título
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Taller de Yoga Restaurativo"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Fecha y hora inicio
              </label>
              <input
                type="datetime-local"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Fecha y hora fin (opcional)
              </label>
              <input
                type="datetime-local"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Ubicación
              </label>
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Capacidad (opcional)
              </label>
              <input
                type="number"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                placeholder="Sin límite si se deja vacío"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-[#2C2421] mb-4 pt-2 border-t border-gray-100">
            Precios y créditos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Precio regular (MXN)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  value={precioRegular}
                  onChange={(e) => setPrecioRegular(e.target.value)}
                  placeholder="0 si es gratis"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wide text-green-600 uppercase mb-1.5">
                Miembros K (opcional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  value={precioMiembros}
                  onChange={(e) => setPrecioMiembros(e.target.value)}
                  placeholder="Ej: 1099"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold tracking-wide text-green-600 uppercase mb-1.5">
              Límite precio miembros K
            </label>
            <input
              type="datetime-local"
              value={limiteMiembros}
              onChange={(e) => setLimiteMiembros(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2.5 rounded-xl border border-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-blue-600 uppercase mb-1.5">
                Créditos a otorgar
              </label>
              <input
                type="number"
                value={creditos}
                onChange={(e) => setCreditos(e.target.value)}
                placeholder="Ej: 12"
                className="w-full px-4 py-2.5 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wide text-blue-600 uppercase mb-1.5">
                Días de validez
              </label>
              <input
                type="number"
                value={diasValidez}
                onChange={(e) => setDiasValidez(e.target.value)}
                placeholder="Ej: 21"
                className="w-full px-4 py-2.5 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
              Imagen (opcional)
            </label>
            <ImageUpload value={imagenUrl} onChange={setImagenUrl} />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
              Descripción (opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Describe el evento..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421] resize-y"
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
              {saving ? "Guardando..." : "Crear evento"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="text-sm text-gray-500 hover:text-[#2C2421] font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-gray-400">Cargando...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400">No hay eventos todavía.</p>
        ) : (
          items.map((evento) => {
            const cancelado = evento.estado === "cancelado";
            return (
              <div
                key={evento.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
              >
                <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {evento.imagen_url && (
                    <img
                      src={evento.imagen_url}
                      alt={evento.titulo}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#2C2421] text-sm">
                    {evento.titulo}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatRango(evento.fecha_inicio, evento.fecha_fin)}
                  </p>
                  {!cancelado && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-50 border border-gray-100 text-gray-600">
                        Reg: ${evento.precio_regular.toLocaleString("es-MX")}
                      </span>
                      <span className="text-xs text-gray-400">
                        {conteos[evento.id] || 0}
                      </span>
                      {evento.creditos_otorgados > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 border border-blue-100 text-blue-600">
                          +{evento.creditos_otorgados} Créditos
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {cancelado ? (
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 shrink-0">
                    Evento Cancelado
                  </span>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setModalEvento(evento)}
                      className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-[#2C2421] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Ver Registrados
                    </button>
                    <button
                      onClick={() => handleDelete(evento.id)}
                      className="p-2.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {modalEvento && (
        <EventRegistrationsModal
          eventoId={modalEvento.id}
          eventoTitulo={modalEvento.titulo}
          onClose={() => setModalEvento(null)}
        />
      )}
    </div>
  );
}