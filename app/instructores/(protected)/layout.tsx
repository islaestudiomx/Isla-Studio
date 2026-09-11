"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

type StaffRole = "admin" | "instructor";

const StaffAuthContext = createContext<{ role: StaffRole | null }>({
  role: null,
});

export function useStaffAuth() {
  return useContext(StaffAuthContext);
}

export default function InstructoresProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<StaffRole | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/instructores/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!isMounted) return;

      if (profile?.role !== "admin" && profile?.role !== "instructor") {
        router.replace("/instructores/login");
        return;
      }

      setRole(profile.role as StaffRole);
      setChecking(false);
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checking || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EF]">
        <p className="text-sm text-gray-500">Verificando acceso...</p>
      </div>
    );
  }

  return (
    <StaffAuthContext.Provider value={{ role }}>
      <div className="min-h-screen bg-[#F5F2EF]">{children}</div>
    </StaffAuthContext.Provider>
  );
}