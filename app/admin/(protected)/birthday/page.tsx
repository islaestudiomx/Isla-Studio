"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Cake } from "lucide-react";

type Cliente = {
  id: string;
  full_name: string | null;
  fecha_nacimiento: string;
};

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const MESES_ABREV = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

export default function BirthdayPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, fecha_nacimiento")
        .not("fecha_nacimiento", "is", null);
      setClientes(data ?? []);
      setLoading(false);
    };

    fetchClientes();
  }, []);

  const mesActual = new Date().getMonth(); // 0-indexado

  const porMes: Cliente[][] = Array.from({ length: 12 }, () => []);
  clientes.forEach((c) => {
    const mes = new Date(c.fecha_nacimiento).getUTCMonth();
    porMes[mes].push(c);
  });
  porMes.forEach((lista) =>
    lista.sort(
      (a, b) =>
        new Date(a.fecha_nacimiento).getUTCDate() -
        new Date(b.fecha_nacimiento).getUTCDate()
    )
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#2C2421]">Cumpleaños</h1>
          <p className="text-sm text-gray-500 mt-1">
            Celebra con tus clientes y fideliza a tu comunidad
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2">
          <Cake className="w-4 h-4 text-pink-500" />
          <span className="text-sm font-semibold text-[#2C2421]">
            {clientes.length} Registros
          </span>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {porMes.map((lista, i) => {
            const esMesActual = i === mesActual;
            return (
              <div
                key={i}
                className={`bg-white rounded-2xl border p-4 ${
                  esMesActual ? "border-pink-200" : "border-gray-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  <h2
                    className={`font-semibold ${
                      esMesActual ? "text-pink-600" : "text-[#2C2421]"
                    }`}
                  >
                    {MESES[i]}
                  </h2>
                  {esMesActual && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-pink-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      Mes actual
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {lista.length === 0 ? (
                    <p className="text-xs text-gray-400">Sin registros.</p>
                  ) : (
                    lista.map((c) => {
                      const dia = new Date(c.fecha_nacimiento).getUTCDate();
                      return (
                        <div
                          key={c.id}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                            esMesActual ? "bg-pink-50" : "bg-gray-50"
                          }`}
                        >
                          <div
                            className={`shrink-0 w-11 h-11 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold ${
                              esMesActual
                                ? "bg-pink-500 text-white"
                                : "bg-[#2C2421]/10 text-[#2C2421]"
                            }`}
                          >
                            <span>{MESES_ABREV[i]}</span>
                            <span>{dia}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#2C2421] truncate">
                              {c.full_name || "Sin nombre"}
                            </p>
                            {esMesActual && (
                              <p className="text-xs text-pink-600 font-medium">
                                ¡Feliz cumpleaños!
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}