import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// set up using environment variables if available (fallback to hardcoded values for dev)
const SUPABASE_URL =
  import.meta.env?.SUPABASE_URL ||
  "https://tketdfixfdwtpzxwrosx.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env?.SUPABASE_ANON_KEY ||
  "sb_publishable_-LJuTuIv1lRC8Lv1dVQTow_a9iB4DF5";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);