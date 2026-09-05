"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/utils/supabase";

type Cliente = {
  id: string;
  full_name: string | null;
};

type Paquete = {
  id: string;
  nombre: string;
  num_clases: number;
  vigencia_dias: number;
};

type ReservaResumen = {
  cliente_id: string;
  estado: string;
  created_at: string;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [reservas, setReservas] = useState<ReservaResumen[]>([]);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState<Record<string, string>>({});
  const [asignando, setAsignando] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: clientesData }, { data: reservasData }, { data: paquetesData }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "client")
          .order("full_name"),
        supabase.from("reservas").select("cliente_id, estado, created_at"),
        supabase
          .from("paquetes")
          .select("id, nombre, num_clases, vigencia_dias")
          .eq("activo", true)
          .order("nombre"),
      ]);

    setClientes(clientesData ?? []);
    setReservas(reservasData ?? []);
    setPaquetes(paquetesData ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resumenPorCliente = useMemo(() => {
    const map: Record<
      string,
      { total: number; confirmadas: number; ultima: string | null }
    > = {};

    for (const r of reservas) {
      if (!map[r.cliente_id]) {
        map[r.cliente_id] = { total: 0, confirmadas: 0, ultima: null };
      }
      map[r.cliente_id].total += 1;
      if (r.estado === "confirmada") map[r.cliente_id].confirmadas += 1;
      if (!map[r.cliente_id].ultima || r.created_at > map[r.cliente_id].ultima!) {
        map[r.cliente_id].ultima = r.created_at;
      }
    }

    return map;
  }, [reservas]);

  const clientesFiltrados = clientes.filter((c) =>
    (c.full_name || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleAsignar = async (
    clienteId: string,
    metodo: "efectivo" | "transferencia"
  ) => {
    const paqueteId = seleccion[clienteId];
    if (!paqueteId) return;

    const paquete = paquetes.find((p) => p.id === paqueteId);
    if (!paquete) return;

    setAsignando(clienteId);

    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + paquete.vigencia_dias);

    await supabase.from("compras_paquetes").insert({
      cliente_id: clienteId,
      paquete_id: paquete.id,
      paquete_nombre: paquete.nombre,
      creditos_totales: paquete.num_clases,
      creditos_restantes: paquete.num_clases,
      metodo_pago: metodo,
      fecha_vencimiento: fechaVencimiento.toISOString(),
    });

    setAsignando(null);
    setSeleccion((prev) => ({ ...prev, [clienteId]: "" }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#2C2421]">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {clientes.length} clientes registrados
          </p>
        </div>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-64 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Cliente
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Reservas totales
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Confirmadas
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Última reserva
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Cargando...
                </td>
              </tr>
            ) : clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Sin resultados.
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((cliente) => {
                const r = resumenPorCliente[cliente.id];
                return (
                  <tr key={cliente.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#2C2421]">
                        {cliente.full_name || "Sin nombre"}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {cliente.id.slice(0, 8)}...
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{r?.total ?? 0}</td>
                    <td className="px-6 py-4 text-green-600 font-medium">
                      {r?.confirmadas ?? 0}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {r?.ultima ? (
                        new Date(r.ultima).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      ) : (
                        <span className="italic text-gray-400">Ninguna aún</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 w-44">
                        <select
                          value={seleccion[cliente.id] || ""}
                          onChange={(e) =>
                            setSeleccion((prev) => ({
                              ...prev,
                              [cliente.id]: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20"
                        >
                          <option value="">Elegir paquete...</option>
                          {paquetes.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            disabled={!seleccion[cliente.id] || asignando === cliente.id}
                            onClick={() => handleAsignar(cliente.id, "efectivo")}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-40"
                          >
                            Pago Físico
                          </button>
                          <button
                            disabled={!seleccion[cliente.id] || asignando === cliente.id}
                            onClick={() => handleAsignar(cliente.id, "transferencia")}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-40"
                          >
                            Transferencia
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}