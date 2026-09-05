"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

type Disciplina = {
  id: string;
  nombre: string;
  descripcion: string | null;
  texto_extra: string | null;
  imagen_url: string | null;
  alineacion_imagen: string;
};

const ALINEACION_CLASS: Record<string, string> = {
  centro: "object-center",
  izquierda: "object-left",
  derecha: "object-right",
};

export default function DisciplinasSection() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisciplinas = async () => {
      const { data } = await supabase
        .from("disciplinas")
        .select("*")
        .order("created_at", { ascending: true });
      setDisciplinas(data ?? []);
      setLoading(false);
    };

    fetchDisciplinas();
  }, []);

  if (loading || disciplinas.length === 0) return null;

  return (
    <section className="bg-[#F5F2EF] py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-4xl text-[#2C2421] mb-10">
          Disciplinas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {disciplinas.map((d) => (
            <div
              key={d.id}
              className="relative h-[480px] rounded-2xl overflow-hidden group"
            >
              {d.imagen_url && (
                <img
                  src={d.imagen_url}
                  alt={d.nombre}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    ALINEACION_CLASS[d.alineacion_imagen] || "object-center"
                  }`}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white font-bold text-xl uppercase tracking-wide mb-2">
                  {d.nombre}
                </h3>
                {d.descripcion && (
                  <p className="text-white/85 text-sm leading-relaxed">
                    {d.descripcion}
                  </p>
                )}
                {d.texto_extra && (
                  <p className="text-white/70 text-xs italic font-semibold uppercase tracking-wide mt-3">
                    {d.texto_extra}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}