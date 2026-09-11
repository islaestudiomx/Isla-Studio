"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function InstructoresLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setLoading(false);
      setError("Correo o contraseña incorrectos.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (
      profileError ||
      (profile?.role !== "admin" && profile?.role !== "instructor")
    ) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Esta cuenta no tiene acceso al panel de instructores.");
      return;
    }

    router.push("/instructores");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2EF] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="font-serif text-2xl text-[#2C2421] mb-1 text-center">
          ISLA
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Panel de instructores
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C2421]/20 focus:border-[#2C2421]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2C2421] hover:bg-black text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
          <div className="flex justify-center">
            <a href="/" className="text-sm underline text-gray-700 hover:text-black">Volver al inicio</a>
          </div>
        </form>
      </div>
    </div>
  );
}