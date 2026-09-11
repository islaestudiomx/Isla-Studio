"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { Plus, Users, Trash2, X, Search } from "lucide-react";
import ImageUpload from "@/app/components/admin/ImageUpload";

type Evento = {
  id: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  ubicacion: string | null;
  precio_regular: number;
  imagen_url: string | null;
  estado: string;
};

type Registro = {
  id: string;
  cliente_id: string | null;
  nombre: string | null;
  email: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
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
            Precio
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
                        {conteos[evento.id] || 0} registrados
                      </span>
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
        <EventRegistrationsModalWithSearch
          eventoId={modalEvento.id}
          eventoTitulo={modalEvento.titulo}
          onClose={() => {
            setModalEvento(null);
            fetchAll();
          }}
        />
      )}
    </div>
  );
}

// Subcomponente interno del modal de registrados con buscador integrado
function EventRegistrationsModalWithSearch({
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
  const [buscando, setBuscando] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchRegistros = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("eventos_registros")
      .select("*")
      .eq("evento_id", eventoId)
      .order("created_at", { ascending: false });

    setRegistros(data ?? []);
    setLoading(false);
  }, [eventoId]);

  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

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

  const handleAgregarUsuario = async (profile: Profile) => {
    setSaving(true);
    const { error } = await supabase.from("eventos_registros").insert({
      evento_id: eventoId,
      cliente_id: profile.id,
      nombre: profile.full_name || "Sin nombre",
      email: profile.email || "",
    });

    setSaving(false);

    if (error) {
      alert("Error al registrar: " + error.message);
      return;
    }

    setBuscando(false);
    setBusqueda("");
    fetchRegistros();
  };

  const handleEliminar = async (registroId: string) => {
    if (!confirm("¿Eliminar este registro del evento?")) return;
    await supabase.from("eventos_registros").delete().eq("id", registroId);
    fetchRegistros();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-serif text-xl text-[#2C2421] font-medium">Registrados</h2>
            <p className="text-xs text-gray-400 mt-0.5">{eventoTitulo}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#2C2421]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Asistentes ({registros.length})
            </span>
            <button
              onClick={() => setBuscando(!buscando)}
              className="text-xs font-semibold text-[#2C2421] border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              {buscando ? "Cerrar buscador" : "+ Agregar asistente"}
            </button>
          </div>

          {buscando && (
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar usuario o correo..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2C2421]"
                  autoFocus
                />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {perfilesFiltrados.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">No se encontraron cuentas.</p>
                ) : (
                  perfilesFiltrados.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAgregarUsuario(p)}
                      disabled={saving}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-colors flex items-center justify-between border border-transparent hover:border-gray-200"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#2C2421]">
                          {p.full_name || "Sin nombre"}
                        </p>
                        <p className="text-[10px] text-gray-400">{p.email}</p>
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                        + Añadir
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-xs text-gray-400 text-center py-8">Cargando...</p>
          ) : registros.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">Nadie se ha registrado todavía.</p>
          ) : (
            <div className="space-y-2">
              {registros.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between bg-gray-50/50 border border-gray-100 px-4 py-2.5 rounded-xl text-sm"
                >
                  <div>
                    <p className="font-medium text-[#2C2421] text-xs">
                      {r.nombre || "Usuario"}
                    </p>
                    <p className="text-[11px] text-gray-400">{r.email}</p>
                  </div>
                  <button
                    onClick={() => handleEliminar(r.id)}
                    className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#2C2421] hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}