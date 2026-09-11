"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { User, Mail, Cake, KeyRound } from "lucide-react";

export default function PerfilPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [creadoEl, setCreadoEl] = useState("");
  const [editando, setEditando] = useState(false);
  const [nombreEditado, setNombreEditado] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, fecha_nacimiento, created_at")
        .eq("id", user.id)
        .single();

      setNombre(profile?.full_name || "");
      setNombreEditado(profile?.full_name || "");
      setFechaNacimiento(profile?.fecha_nacimiento || "");
      setCreadoEl(profile?.created_at || "");

      setChecking(false);
    };

    init();
  }, [router]);

  const handleGuardar = async () => {
    if (!nombreEditado.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: nombreEditado.trim() })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setNombre(nombreEditado.trim());
    setEditando(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EF]">
        <p className="text-sm text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EF]">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-24 md:py-28">
        <h1 className="font-serif text-3xl md:text-4xl text-[#2C2421] mb-1">
          Mi perfil
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Información de tu cuenta.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="flex items-center gap-4 px-6 py-6 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-[#2C2421] flex items-center justify-center shrink-0">
              <span className="text-white font-bold">
                {(nombre || "?").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-[#2C2421]">{nombre || "Sin nombre"}</p>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Nombre completo</span>
              </div>

              {editando ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nombreEditado}
                    onChange={(e) => setNombreEditado(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20"
                  />
                  <button
                    onClick={handleGuardar}
                    disabled={saving}
                    className="text-xs font-semibold text-white bg-[#2C2421] rounded-lg px-3 py-1.5 disabled:opacity-50"
                  >
                    {saving ? "..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => {
                      setEditando(false);
                      setNombreEditado(nombre);
                      setError("");
                    }}
                    className="text-xs text-gray-500 hover:text-[#2C2421]"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#2C2421]">
                    {nombre || "Sin nombre"}
                  </span>
                  
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Correo electrónico</span>
              </div>
              <span className="text-sm font-medium text-[#2C2421]">{email}</span>
            </div>

            {fechaNacimiento && (
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <Cake className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Fecha de nacimiento</span>
                </div>
                <span className="text-sm font-medium text-[#2C2421]">
                  {new Date(fechaNacimiento + "T00:00:00").toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}

            {creadoEl && (
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-sm text-gray-500">Miembro desde</span>
                <span className="text-sm font-medium text-[#2C2421]">
                  {new Date(creadoEl).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-6 py-3">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600 bg-green-50 px-6 py-3">
              Nombre actualizado correctamente.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KeyRound className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-[#2C2421]">Contraseña</p>
                <p className="text-xs text-gray-500">
                  Cambia la contraseña de tu cuenta.
                </p>
              </div>
            </div>
            <Link
              href="/reset-password"
              className="text-sm font-semibold text-[#2C2421] border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Cambiar contraseña
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}