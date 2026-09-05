"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ImageUpload from "@/app/components/admin/ImageUpload";

type Disciplina = {
  id: string;
  nombre: string;
  texto_extra: string | null;
  descripcion: string | null;
  imagen_url: string | null;
  alineacion_imagen: string;
};

const ALINEACIONES = [
  { value: "centro", label: "Centro" },
  { value: "izquierda", label: "Izquierda" },
  { value: "derecha", label: "Derecha" },
];

export default function DisciplinasPage() {
  const [items, setItems] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [textoExtra, setTextoExtra] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [alineacion, setAlineacion] = useState("centro");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("disciplinas")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setNombre("");
    setTextoExtra("");
    setDescripcion("");
    setImagenUrl("");
    setAlineacion("centro");
    setEditingId(null);
    setError("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (item: Disciplina) => {
    setNombre(item.nombre);
    setTextoExtra(item.texto_extra ?? "");
    setDescripcion(item.descripcion ?? "");
    setImagenUrl(item.imagen_url ?? "");
    setAlineacion(item.alineacion_imagen ?? "centro");
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !descripcion.trim()) {
      setError("Título y descripción son obligatorios.");
      return;
    }

    setSaving(true);

    const payload = {
      nombre: nombre.trim(),
      texto_extra: textoExtra.trim() || null,
      descripcion: descripcion.trim(),
      imagen_url: imagenUrl || null,
      alineacion_imagen: alineacion,
    };

    const { error } = editingId
      ? await supabase.from("disciplinas").update(payload).eq("id", editingId)
      : await supabase.from("disciplinas").insert(payload);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    resetForm();
    setShowForm(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta disciplina?")) return;
    await supabase.from("disciplinas").delete().eq("id", id);
    fetchItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-[#2C2421]">Disciplinas</h1>
        {!showForm && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-[#2C2421] hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva disciplina
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 p-6 mb-8"
        >
          <h2 className="font-semibold text-[#2C2421] mb-5">
            {editingId ? "Editar disciplina" : "Nueva disciplina"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Título
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Texto extra (opcional)
              </label>
              <input
                type="text"
                value={textoExtra}
                onChange={(e) => setTextoExtra(e.target.value)}
                placeholder="Ej: Alta tensión profunda"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421] resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Imagen de la disciplina
              </label>
              <ImageUpload value={imagenUrl} onChange={setImagenUrl} />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Alineación de imagen
              </label>
              <select
                value={alineacion}
                onChange={(e) => setAlineacion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              >
                {ALINEACIONES.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>
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
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
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
          <p className="text-sm text-gray-400">No hay disciplinas todavía.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                {item.imagen_url && (
                  <img
                    src={item.imagen_url}
                    alt={item.nombre}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#2C2421] text-sm">
                  {item.nombre}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {item.descripcion}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 rounded-lg text-gray-400 hover:text-[#2C2421] hover:bg-gray-50"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}