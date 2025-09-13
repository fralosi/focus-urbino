import { createClient } from '@supabase/supabase-js'

// SOSTITUISCI con i tuoi valori salvati
const supabaseUrl = 'https://hhmljetjcnuypinfrlfm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobWxqZXRqY251eXBpbmZybGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTUwNjIsImV4cCI6MjA3MzI3MTA2Mn0.X6wvhR3_Pn2YfYgI0mj8LZ8IaZr59GWjsjagUD92UQc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funzioni helper per l'app
export const getCurrentUser = () => supabase.auth.getUser()

export const signOut = () => supabase.auth.signOut()

export const updateUserLocation = async (userId, latitude, longitude) => {
  const { data, error } = await supabase
    .from('user_locations')
    .upsert({
      user_id: userId,
      latitude,
      longitude,
      is_active: true,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });
  
  return { data, error };
}

export const saveFocusSession = async (userId, durationMinutes, sessionType = 'focus') => {
  const { data, error } = await supabase
    .from('focus_sessions')
    .insert([
      {
        user_id: userId,
        duration_minutes: durationMinutes,
        session_type: sessionType,
        completed_at: new Date().toISOString()
      }
    ]);
  
  return { data, error };
}