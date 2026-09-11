"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { useStaffAuth } from "./layout";
import ScheduleManager from "@/app/components/shared/ScheduleManager";

export default function InstructoresHorariosPage() {
  const router = useRouter();
  const { role } = useStaffAuth();
  const isAdmin = role === "admin";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/instructores/login");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <ScheduleManager
        isAdmin={isAdmin}
        subtitulo={isAdmin ? "Vista de administrador" : "Vista de instructor"}
        onLogout={handleLogout}
      />
    </div>
  );
}