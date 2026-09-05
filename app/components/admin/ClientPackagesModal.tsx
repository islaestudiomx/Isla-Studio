"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { X, Pencil } from "lucide-react";

type Compra = {
  id: string;
  paquete_nombre: string;
  creditos_restantes: number;
  fecha_vencimiento: string;
};

export default function ClientPackagesModal({
  clienteId,
  clienteNombre,
  clienteEmail,
  onClose,
}: {
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string | null;
  onClose: () => void;
}) {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompras = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("compras_paquetes")
      .select("id, paquete_nombre, creditos_restantes, fecha_vencimiento")
      .eq("cliente_id", clienteId)
      .order("fecha_vencimiento", { ascending: false });

    setCompras(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCompras();
  }, [clienteId]);

  const now = new Date();
  const activos = compras.filter(
    (c) => c.creditos_restantes > 0 && new Date(c.fecha_vencimiento) >= now
  );
  const historial = compras.filter(
    (c) => !(c.creditos_restantes > 0 && new Date(c.fecha_vencimiento) >= now)
  );

  const handleEditCreditos = async (compra: Compra) => {
    const nuevo = window.prompt(
      `Créditos restantes para "${compra.paquete_nombre}":`,
      String(compra.creditos_restantes)
    );
    if (nuevo === null) return;

    const valor = parseInt(nuevo, 10);
    if (isNaN(valor) || valor < 0) return;

    await supabase
      .from("compras_paquetes")
      .update({ creditos_restantes: valor })
      .eq("id", compra.id);

    fetchCompras();
  };

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-xl text-[#2C2421]">
              {clienteNombre}
            </h2>
            {clienteEmail && (
              <p className="text-sm text-gray-500 mt-0.5">{clienteEmail}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#2C2421]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-6">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
          ) : (
            <>
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-green-600 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Paquetes activos ({activos.length})
                </p>
                {activos.length === 0 ? (
                  <p className="text-sm text-gray-400">Sin paquetes activos.</p>
                ) : (
                  <div className="space-y-2">
                    {activos.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#2C2421]">
                            {c.paquete_nombre}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            <span className="text-blue-500 font-medium">
                              {c.creditos_restantes} créditos
                            </span>{" "}
                            · Vence {formatFecha(c.fecha_vencimiento)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEditCreditos(c)}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#2C2421] hover:bg-gray-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
                  Historial / vencidos ({historial.length})
                </p>
                {historial.length === 0 ? (
                  <p className="text-sm text-gray-400">Sin historial todavía.</p>
                ) : (
                  <div className="space-y-2">
                    {historial.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 opacity-70"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#2C2421]">
                            {c.paquete_nombre}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {c.creditos_restantes} créditos · Venció{" "}
                            {formatFecha(c.fecha_vencimiento)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEditCreditos(c)}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#2C2421] hover:bg-gray-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}