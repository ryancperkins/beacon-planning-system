import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useInboxCount() {
  const { church } = useAuth();

  const { data: count = 0 } = useQuery({
    queryKey: ["inbox-count", church?.id],
    queryFn: async () => {
      if (!church?.id) return 0;
      const { count, error } = await supabase
        .from("initiatives")
        .select("*", { count: "exact", head: true })
        .eq("church_id", church.id)
        .in("status", ["Intake", "Needs Info"]);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!church?.id,
  });

  return count;
}
