"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Eye, History } from "lucide-react";
import ClientPackagesModal from "@/app/components/admin/ClientPackagesModal";
import ClientHistoryModal from "@/app/components/admin/ClientHistoryModal";

type Cliente = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export default function ClientesInfoPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalPaquetes, setModalPaquetes] = useState<Cliente | null>(null);
  const [modalHistorial, setModalHistorial] = useState<Cliente | null>(null);

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "client")
        .order("full_name");
      setClientes(data ?? []);
      setLoading(false);
    };

    fetchClientes();
  }, []);

  const filtrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase();
    return (
      (c.full_name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-[#2C2421]">Info de Clientes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Administra manualmente los paquetes, vigencias y revisa el historial de
          los clientes.
        </p>
      </div>

      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o correo..."
        className="w-full max-w-md mb-6 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Cliente
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-400">
                  Cargando...
                </td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-400">
                  Sin resultados.
                </td>
              </tr>
            ) : (
              filtrados.map((cliente) => (
                <tr key={cliente.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4 font-medium text-[#2C2421]">
                    {cliente.full_name || "Sin nombre"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setModalPaquetes(cliente)}
                        className="p-2 rounded-lg text-gray-400 hover:text-[#2C2421] hover:bg-gray-50"
                        title="Ver paquetes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setModalHistorial(cliente)}
                        className="p-2 rounded-lg text-gray-400 hover:text-[#2C2421] hover:bg-gray-50"
                        title="Historial de reservas"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalPaquetes && (
        <ClientPackagesModal
          clienteId={modalPaquetes.id}
          clienteNombre={modalPaquetes.full_name || "Sin nombre"}
          clienteEmail={modalPaquetes.email}
          onClose={() => setModalPaquetes(null)}
        />
      )}

      {modalHistorial && (
        <ClientHistoryModal
          clienteId={modalHistorial.id}
          clienteNombre={modalHistorial.full_name || "Sin nombre"}
          onClose={() => setModalHistorial(null)}
        />
      )}
    </div>
  );
}