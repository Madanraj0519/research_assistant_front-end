import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Edit2, Calendar, Loader2 } from 'lucide-react';
import { getNotesByUserApi, deleteNoteApi } from '../services/api/notesApi';
import { NoteData } from '../apiTypes/types';

const NotesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch notes on mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getNotesByUserApi();
        setNotes(response.data);
      } catch (err: any) {
        console.error('Error fetching notes:', err);
        const errorMessage = err?.response?.data?.message || 'Failed to load notes. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNoteApi(id);
        // Remove the deleted note from state
        setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      } catch (err: any) {
        console.error('Error deleting note:', err);
        const errorMessage = err?.response?.data?.message || 'Failed to delete note. Please try again.';
        alert(errorMessage);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Notes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{notes.length} saved items</p>
        </div>
        <button
          onClick={() => navigate('/notes/new')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search notes..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Loading notes...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredNotes.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 opacity-50" />
          </div>
          <p>{searchTerm ? 'No notes found' : 'No notes yet'}</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 px-4 py-2 text-primary-600 hover:text-primary-700"
            >
              Clear search
            </button>
          )}
          {!searchTerm && (
            <button
              onClick={() => navigate('/notes/new')}
              className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
            >
              Create your first note
            </button>
          )}
        </div>
      )}

      {/* Notes List */}
      {!loading && !error && filteredNotes.length > 0 && (
        <div className="space-y-3">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer group"
              onClick={() => navigate(`/notes/${note.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{note.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 rounded">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, note.id)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed mb-3">
                {note.content}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(note.createdAt)}
                </div>
                {note.favorite && (
                  <span className="text-yellow-500">★</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesPage;