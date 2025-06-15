
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setNotes(data || []);
    setLoading(false);
  }, [user]);

  const addNote = useCallback(
    async (title: string, content: string) => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("notes")
        .insert({ user_id: user.id, title, content })
        .select()
        .maybeSingle();
      if (error) setError(error.message);
      if (data) setNotes((n) => [data, ...n]);
      return data;
    },
    [user]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) setError(error.message);
      setNotes((n) => n.filter((note) => note.id !== id));
    },
    []
  );

  return {
    notes,
    error,
    loading,
    fetchNotes,
    addNote,
    deleteNote,
  };
}
