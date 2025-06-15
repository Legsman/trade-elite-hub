
import MainLayout from "@/components/layout/MainLayout";
import { NotesList } from "@/components/notes/NotesList";

export default function NotesPage() {
  return (
    <MainLayout>
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-4">My Notes</h1>
        <NotesList />
      </div>
    </MainLayout>
  );
}
