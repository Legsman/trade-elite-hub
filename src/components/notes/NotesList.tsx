
import { useEffect, useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";

export function NotesList() {
  const { notes, loading, error, fetchNotes, addNote, deleteNote } = useNotes();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    await addNote(title, content);
    setTitle("");
    setContent("");
    setAdding(false);
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <form className="space-y-2" onSubmit={handleAdd}>
        <Input
          placeholder="Title"
          value={title}
          disabled={adding}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          placeholder="Content"
          value={content}
          disabled={adding}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <Button type="submit" disabled={adding || !title}>
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Note"}
        </Button>
      </form>
      {loading ? (
        <div className="flex justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : notes.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No notes yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="relative p-4 group">
              <div className="text-lg font-medium">{note.title}</div>
              <div className="mb-2 text-muted-foreground text-sm">{note.created_at && new Date(note.created_at).toLocaleString()}</div>
              <div className="mb-2 whitespace-pre-wrap">{note.content}</div>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition group-hover:bg-red-50"
                onClick={() => deleteNote(note.id)}
                aria-label="Delete note"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
