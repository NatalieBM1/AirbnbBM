import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://gaeactagadremeymxkky.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZWFjdGFnYWRyZW1leW14a2t5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgyNDY0OCwiZXhwIjoyMDczNDAwNjQ4fQ.gChBbD1XaqbeUn2xXNGCgKyM1F-PsjlqOBXNvXo-9Rk";

export const supabase = createClient(supabaseUrl, supabaseKey);
