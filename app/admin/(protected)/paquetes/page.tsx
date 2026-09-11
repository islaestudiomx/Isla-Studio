"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Plus, Eye, EyeOff, Trash2 } from "lucide-react";

type Paquete = {
  id: string;
  nombre: string;
  vigencia_dias: number;
  num_clases: number;
  precio: number;
  activo: boolean;
  categoria: string | null;
  compartido: boolean;
};

const VIGENCIAS = [
  { label: "1 semana", dias: 7 },
  { label: "1 mes", dias: 30 },
  { label: "3 meses", dias: 90 },
];

const CATEGORIAS = [
  { value: "", label: "Todas las disciplinas" },
  { value: "yoga", label: "Yoga" },
  { value: "pilates", label: "Pilates" },
  { value: "barre", label: "Barre" },
];

function labelVigencia(dias: number) {
  const match = VIGENCIAS.find((v) => v.dias === dias);
  return match ? match.label : `${dias} días`;
}

function labelCategoria(categoria: string | null) {
  const match = CATEGORIAS.find((c) => c.value === (categoria ?? ""));
  return match ? match.label : categoria;
}

export default function PaquetesPage() {
  const [items, setItems] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [nombre, setNombre] = useState("");
  const [vigenciaDias, setVigenciaDias] = useState("7");
  const [categoria, setCategoria] = useState("");
  const [numClases, setNumClases] = useState("");
  const [precio, setPrecio] = useState("");
  const [compartido, setCompartido] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("paquetes")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setNombre("");
    setVigenciaDias("7");
    setCategoria("");
    setNumClases("");
    setPrecio("");
    setCompartido(false);
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
      categoria: categoria || null,
      num_clases: parseInt(numClases, 10),
      precio: parseFloat(precio),
      compartido,
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
                Disciplina <span className="text-red-400">*</span>
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Solo se podrá usar en clases de esta disciplina, a menos que elijas
                "Todas las disciplinas"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
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

          <label className="flex items-center gap-2 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={compartido}
              onChange={(e) => setCompartido(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#2C2421] focus:ring-[#2C2421]/30"
            />
            <span className="text-sm text-gray-700">
              Paquete compartido (permite reservar varios espacios, ej. "Elite Mix")
            </span>
          </label>

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
                Disciplina
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
                    {item.compartido && (
                      <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-100">
                        Compartido
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {labelVigencia(item.vigencia_dias)}
                  </td>
                  <td className="px-6 py-4 text-gray-600 capitalize">
                    {labelCategoria(item.categoria)}
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