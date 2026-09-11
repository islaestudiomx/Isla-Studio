"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Package, AlertCircle, Users, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

type SesionConDatos = {
  id: string;
  fecha_hora: string;
  duracion_min: number;
  capacidad: number;
  ubicacion: string | null;
  disciplinas: { id: string; nombre: string } | null;
  instructores: { nombre: string } | null;
  espacios_disponibles: number;
};

type CompraPaquete = {
  id: string;
  creditos_restantes: number;
  fecha_vencimiento: string;
  paquetes: { nombre: string; categoria: string | null; compartido: boolean } | null;
};

function categoriaDeClase(nombre: string) {
  return nombre.trim().split(" ")[0]?.toLowerCase() ?? "";
}

function esCompatible(compra: CompraPaquete, categoriaSesion: string) {
  const categoriaPaquete = compra.paquetes?.categoria ?? null;
  if (categoriaPaquete === null) return true; // "Todas las disciplinas"
  return categoriaPaquete === categoriaSesion;
}

export default function BookingModal({
  sesion,
  onClose,
  onReserved,
}: {
  sesion: SesionConDatos;
  onClose: () => void;
  onReserved: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allPackages, setAllPackages] = useState<CompraPaquete[]>([]);
  const [compatiblePackages, setCompatiblePackages] = useState<CompraPaquete[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [userName, setUserName] = useState("Reserva");
  const [guestNames, setGuestNames] = useState<string[]>([""]);

  const categoriaSesion = categoriaDeClase(sesion.disciplinas?.nombre ?? "");

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingPackages(false);
        return;
      }

      // Obtener el nombre del perfil del usuario logueado
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const nombreReal = profile?.full_name || "Reserva";
      setUserName(nombreReal);
      setGuestNames([nombreReal]);

      // Obtener paquetes del usuario
      const { data } = await supabase
        .from("compras_paquetes")
        .select(
          "id, creditos_restantes, fecha_vencimiento, paquetes ( nombre, categoria, compartido )"
        )
        .eq("cliente_id", user.id)
        .gt("creditos_restantes", 0)
        .gt("fecha_vencimiento", new Date().toISOString())
        .order("fecha_vencimiento", { ascending: true });

      const pkgs = (data as any) ?? [];
      setAllPackages(pkgs);

      const compatibles = pkgs.filter((p: CompraPaquete) => esCompatible(p, categoriaSesion));
      setCompatiblePackages(compatibles);

      if (compatibles.length > 0) setSelectedId(compatibles[0].id);
      setLoadingPackages(false);
    };

    fetchData();
  }, [categoriaSesion]);

  const selected = useMemo(
    () => compatiblePackages.find((p) => p.id === selectedId) ?? null,
    [compatiblePackages, selectedId]
  );

  const isShared = selected?.paquetes?.compartido ?? false;
  const maxCantidad = selected
    ? Math.min(selected.creditos_restantes, sesion.espacios_disponibles)
    : 1;

  useEffect(() => {
    setGuestNames([userName]);
  }, [selectedId, userName]);

  const updateGuest = (i: number, value: string) =>
    setGuestNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));

  const addGuest = () => {
    if (guestNames.length >= maxCantidad) return;
    setGuestNames((prev) => [...prev, ""]);
  };

  const removeGuest = (i: number) => {
    if (guestNames.length <= 1) return;
    setGuestNames((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleReserve = async () => {
    if (!selectedId) return;

    if (isShared && guestNames.some((n) => !n.trim())) {
      setError("Completa el nombre de cada reserva antes de confirmar.");
      return;
    }

    setLoading(true);
    setError("");

    const nombres = isShared
      ? guestNames.map((n) => n.trim())
      : [guestNames[0]?.trim() || userName];

    const { error } = await supabase.rpc("reservar_clase", {
      p_sesion_id: sesion.id,
      p_compra_id: selectedId,
      p_nombres: nombres,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    onReserved();
    onClose();
  };

  const sinPaquetes = !loadingPackages && allPackages.length === 0;
  const soloIncompatibles =
    !loadingPackages && allPackages.length > 0 && compatiblePackages.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h2 className="font-serif text-xl text-[#2C2421] mb-1">
          {sesion.disciplinas?.nombre}
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          {new Date(sesion.fecha_hora).toLocaleString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Instructor</span>
            <span className="font-medium text-[#2C2421]">
              {sesion.instructores?.nombre ?? "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Duración</span>
            <span className="font-medium text-[#2C2421]">{sesion.duracion_min} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Ubicación</span>
            <span className="font-medium text-[#2C2421]">{sesion.ubicacion}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Espacios disponibles</span>
            <span className="font-medium text-[#2C2421]">{sesion.espacios_disponibles}</span>
          </div>
        </div>

        {loadingPackages ? (
          <div className="py-4 text-center text-gray-400 text-sm">Cargando paquetes...</div>
        ) : sinPaquetes ? (
          <div className="flex flex-col gap-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              <p className="font-semibold text-amber-800 mb-1">Necesitas un paquete activo</p>
              <p className="text-amber-700">
                Para reservar una clase necesitas adquirir un paquete primero.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                router.push("/paquetes");
              }}
              className="w-full bg-[#2C2421] hover:bg-black text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Ver paquetes disponibles
            </button>
            <button onClick={onClose} className="w-full text-gray-500 text-sm py-2">
              Cancelar
            </button>
          </div>
        ) : soloIncompatibles ? (
          <div className="flex flex-col gap-3">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm">
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-800 mb-1">Paquete incompatible</p>
                  <p className="text-orange-700">
                    Tus paquetes activos no incluyen clases de{" "}
                    <strong>{sesion.disciplinas?.nombre}</strong>.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                router.push("/paquetes");
              }}
              className="w-full bg-[#2C2421] hover:bg-black text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Comprar paquete para esta disciplina
            </button>
            <button onClick={onClose} className="w-full text-gray-500 text-sm py-2">
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#2C2421]" /> Selecciona tu paquete
            </p>

            {compatiblePackages.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                  selectedId === p.id
                    ? "border-[#2C2421] bg-[#F5F2EF]"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-[#2C2421] text-sm">{p.paquetes?.nombre}</p>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-[#2C2421] font-bold text-sm">
                      {p.creditos_restantes} clases
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Vence{" "}
                      {new Date(p.fecha_vencimiento).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            {isShared && (
              <div className="bg-[#F5F2EF] border border-[#2C2421]/15 rounded-xl p-4 flex flex-col gap-3">
                <p className="text-sm font-semibold text-[#2C2421] flex items-center gap-2">
                  <Users className="w-4 h-4" /> Este paquete es compartido — puedes reservar varios
                  espacios
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#2C2421]/70">Número de reservas</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeGuest(guestNames.length - 1)}
                      disabled={guestNames.length <= 1}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-[#2C2421]/20 text-[#2C2421] disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold text-[#2C2421] w-5 text-center">
                      {guestNames.length}
                    </span>
                    <button
                      onClick={addGuest}
                      disabled={guestNames.length >= maxCantidad}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-[#2C2421]/20 text-[#2C2421] disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-[#2C2421]/60 -mt-1">
                  Máximo {maxCantidad} (según tus créditos y espacios disponibles)
                </p>

                <div className="flex flex-col gap-2">
                  {guestNames.map((name, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={i === 0 ? "Tu nombre" : `Nombre invitado ${i + 1}`}
                      value={name}
                      onChange={(e) => updateGuest(i, e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2C2421]"
                    />
                  ))}
                </div>
              </div>
            )}

            {!isShared && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 font-medium flex items-center justify-between">
                <span>Reservando como:</span>
                <span className="font-bold text-[#2C2421]">{userName}</span>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>
            )}

            <button
              onClick={handleReserve}
              disabled={loading || !selectedId}
              className="w-full bg-[#2C2421] hover:bg-black text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Confirmar reserva"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}