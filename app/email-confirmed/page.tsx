"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase";

export default function EmailConfirmedPage() {
  const [status, setStatus] = useState<"checking" | "confirmed" | "error">(
    "checking"
  );

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setStatus(session ? "confirmed" : "error");
    };

    checkSession();
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EF] px-4">
        <p className="text-sm text-gray-500">Verificando tu cuenta...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EF] px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="font-serif text-2xl text-[#2C2421] mb-3">
            No pudimos verificar tu cuenta
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            El enlace pudo haber expirado o ya fue usado. Intenta iniciar
            sesión o solicita un nuevo enlace de verificación.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#2C2421] hover:bg-black text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2EF] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-7 h-7 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl text-[#2C2421] mb-2">
          Cuenta verificada
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Ya puedes seguir usando la página con normalidad.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-[#2C2421] hover:bg-black text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors w-full"
        >
          Ir al dashboard
        </Link>
      </div>
    </div>
  );
}