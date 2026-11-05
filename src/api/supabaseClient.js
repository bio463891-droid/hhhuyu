// src/api/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yckynrlrutvphxwccxzi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlja3lucmxydXR2cGh4d2NjeHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4Njc0NjUsImV4cCI6MjA5ODQ0MzQ2NX0.cDompTKOYUbDT-F5lwlJJwE2iaED0klmfo9RGk2L87k";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
