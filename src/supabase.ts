import { createClient } from "@supabase/supabase-js";
import supabaseConfig from "../supabase-applet-config.json";

export const SUPABASE_ACTIVE = true;

// Directly use the provided credentials or fallback only if empty. Auto-sanitize trailing rest/v1 or slashes.
const getSanitizedUrl = () => {
  let url = supabaseConfig.supabaseUrl && supabaseConfig.supabaseUrl.trim() !== ""
    ? supabaseConfig.supabaseUrl.trim()
    : "https://placeholder-project-id.supabase.co";

  // Strip trailing /rest/v1/ or /rest/v1
  url = url.replace(/\/rest\/v1\/?$/, "");
  // Strip any trailing slashes
  url = url.replace(/\/+$/, "");
  return url;
};

const finalUrl = getSanitizedUrl();

const finalKey = supabaseConfig.supabaseAnonKey && supabaseConfig.supabaseAnonKey.trim() !== ""
  ? supabaseConfig.supabaseAnonKey
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.placeholder";

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

console.log(`[Supabase Status] Active: ${SUPABASE_ACTIVE}`);
