import { createClient } from '@supabase/supabase-js'
import { supabase } from "../lib/supabase";


// Sostituisci con i tuoi dati Supabase
const supabaseUrl = 'https://hhmljetjcnuypinfrlfm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobWxqZXRqY251eXBpbmZybGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTUwNjIsImV4cCI6MjA3MzI3MTA2Mn0.X6wvhR3_Pn2YfYgI0mj8LZ8IaZr59GWjsjagUD92UQc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funzione aggiornata: salva posizione + traccia/cover
export async function updateUserLocation(
  userId,
  lat,
  lng,
  trackName = null,
  artistName = null,
  albumCoverUrl = null
) {
  return await supabase
    .from('user_locations')
    .upsert({
      user_id: userId,
      latitude: lat,
      longitude: lng,
      is_active: true,
      updated_at: new Date().toISOString(),
      current_track_name: trackName,
      current_artist_name: artistName,
      current_album_cover_url: albumCoverUrl
    }, { onConflict: 'user_id' });
}

export const getCurrentUser = () => supabase.auth.getUser()
export const signOut = () => supabase.auth.signOut()

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
