"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!isMounted) return;

      if (profile?.role !== "admin") {
        router.replace("/admin/login");
        return;
      }

      setAuthorized(true);
      setChecking(false);
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checking || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EF]">
        <p className="text-sm text-gray-500">Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F5F2EF] min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}