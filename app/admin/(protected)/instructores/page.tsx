"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ImageUpload from "@/app/components/admin/ImageUpload";

type Instructor = {
  id: string;
  nombre: string;
  email: string | null;
  bio: string | null;
  foto_url: string | null;
};

export default function InstructoresPage() {
  const [items, setItems] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("instructores")
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
    setEmail("");
    setFotoUrl("");
    setBio("");
    setEditingId(null);
    setError("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (item: Instructor) => {
    setNombre(item.nombre);
    setEmail(item.email ?? "");
    setFotoUrl(item.foto_url ?? "");
    setBio(item.bio ?? "");
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

    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setSaving(true);

    const payload = {
      nombre: nombre.trim(),
      email: email.trim() || null,
      foto_url: fotoUrl || null,
      bio: bio.trim() || null,
    };

    const { error } = editingId
      ? await supabase.from("instructores").update(payload).eq("id", editingId)
      : await supabase.from("instructores").insert(payload);

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
    if (!confirm("¿Eliminar este instructor?")) return;
    await supabase.from("instructores").delete().eq("id", id);
    fetchItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#2C2421]">Instructores</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona el equipo de instructores
          </p>
        </div>
        {!showForm && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-[#2C2421] hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo instructor
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 p-6 mb-8"
        >
          <h2 className="font-semibold text-[#2C2421] mb-5">
            {editingId ? "Editar instructor" : "Nuevo instructor"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Andrea López"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
              Foto del instructor
            </label>
            <ImageUpload value={fotoUrl} onChange={setFotoUrl} />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Especialidad, experiencia..."
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
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear"}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-sm text-gray-400">Cargando...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400">No hay instructores todavía.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden shrink-0">
                {item.foto_url && (
                  <img
                    src={item.foto_url}
                    alt={item.nombre}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#2C2421] text-sm">
                  {item.nombre}
                </p>
                {item.email && (
                  <a
                    href={`mailto:${item.email}`}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    {item.email}
                  </a>
                )}
                {item.bio && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {item.bio}
                  </p>
                )}
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