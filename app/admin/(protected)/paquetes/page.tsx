"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Plus, Eye, EyeOff, Trash2 } from "lucide-react";

type Disciplina = { id: string; nombre: string };

type Paquete = {
  id: string;
  nombre: string;
  vigencia_dias: number;
  num_clases: number;
  precio: number;
  activo: boolean;
  disciplina_id: string | null;
  disciplinas: { nombre: string } | null;
};

const VIGENCIAS = [
  { label: "1 semana", dias: 7 },
  { label: "1 mes", dias: 30 },
  { label: "3 meses", dias: 90 },
];

function labelVigencia(dias: number) {
  const match = VIGENCIAS.find((v) => v.dias === dias);
  return match ? match.label : `${dias} días`;
}

export default function PaquetesPage() {
  const [items, setItems] = useState<Paquete[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [nombre, setNombre] = useState("");
  const [vigenciaDias, setVigenciaDias] = useState("7");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [numClases, setNumClases] = useState("");
  const [precio, setPrecio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: paquetesData }, { data: disciplinasData }] = await Promise.all([
      supabase
        .from("paquetes")
        .select("*, disciplinas ( nombre )")
        .order("created_at", { ascending: false }),
      supabase.from("disciplinas").select("id, nombre").order("nombre"),
    ]);
    setItems((paquetesData as any) ?? []);
    setDisciplinas(disciplinasData ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setNombre("");
    setVigenciaDias("7");
    setDisciplinaId("");
    setNumClases("");
    setPrecio("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !numClases || !precio) {
      setError("Título, número de clases y precio son obligatorios.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("paquetes").insert({
      nombre: nombre.trim(),
      vigencia_dias: parseInt(vigenciaDias, 10),
      disciplina_id: disciplinaId || null,
      num_clases: parseInt(numClases, 10),
      precio: parseFloat(precio),
      activo: true,
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

  const toggleActivo = async (item: Paquete) => {
    await supabase
      .from("paquetes")
      .update({ activo: !item.activo })
      .eq("id", item.id);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este paquete?")) return;
    await supabase.from("paquetes").delete().eq("id", id);
    fetchAll();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#2C2421]">Paquetes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los paquetes y membresías
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#2C2421] hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo paquete
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 p-6 mb-8"
        >
          <h2 className="font-semibold text-[#2C2421] mb-5">Nuevo paquete</h2>

          <div className="mb-5">
            <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Primera Clase, Flow, Level Up..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Vigencia <span className="text-red-400">*</span>
              </label>
              <select
                value={vigenciaDias}
                onChange={(e) => setVigenciaDias(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              >
                {VIGENCIAS.map((v) => (
                  <option key={v.dias} value={v.dias}>
                    {v.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                = {vigenciaDias} días de vigencia
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Tipo de clase <span className="text-red-400">*</span>
              </label>
              <select
                value={disciplinaId}
                onChange={(e) => setDisciplinaId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              >
                <option value="">Todas las disciplinas</option>
                {disciplinas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Número de clases <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={numClases}
                onChange={(e) => setNumClases(e.target.value)}
                placeholder="Ej: 1, 4, 8, 12..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              />
              <p className="text-xs text-gray-400 mt-1">
                Cuántas clases incluye este paquete
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase mb-1.5">
                Precio (MXN) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
                />
              </div>
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
              {saving ? "Guardando..." : "Crear paquete"}
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

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Título
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Vigencia
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Tipo de clase
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Clases
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Precio
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Estado
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  Cargando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No hay paquetes todavía.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4 font-medium text-[#2C2421]">
                    {item.nombre}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {labelVigencia(item.vigencia_dias)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.disciplinas?.nombre || "Todas las disciplinas"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.num_clases} {item.num_clases === 1 ? "clase" : "clases"}
                  </td>
                  <td className="px-6 py-4 text-[#2C2421] font-medium">
                    ${item.precio.toLocaleString("es-MX")} MXN
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleActivo(item)}
                        className="p-2 rounded-lg text-gray-400 hover:text-[#2C2421] hover:bg-gray-50"
                        title={item.activo ? "Desactivar" : "Activar"}
                      >
                        {item.activo ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}