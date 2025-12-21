import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { createNoteApi, getNoteByIdApi, updateNoteApi } from '../services/api/notesApi';

const NoteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = id && id !== 'new';

  // Fetch note data when editing
  useEffect(() => {
    if (isEditMode) {
      const fetchNote = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await getNoteByIdApi(Number(id));
          setTitle(response.data.title);
          setContent(response.data.content);
        } catch (err: any) {
          console.error('Error fetching note:', err);
          const errorMessage = err?.response?.data?.message || 'Failed to load note. Please try again.';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      fetchNote();
    }
  }, [id, isEditMode]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      alert('Please enter a title or content');
      return;
    }

    const finalTitle = title.trim() || 'Untitled Note';
    const finalContent = content.trim();

    try {
      setSaving(true);
      setError(null);

      if (isEditMode) {
        // Update existing note
        await updateNoteApi(Number(id), {
          title: finalTitle,
          content: finalContent
        });
      } else {
        // Create new note
        await createNoteApi({
          title: finalTitle,
          content: finalContent
        });
      }

      // Navigate back to notes page
      navigate('/notes');
    } catch (err: any) {
      console.error('Error saving note:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to save note. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Loading note...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/notes')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold dark:text-white">
          {isEditMode ? 'Edit Note' : 'New Note'}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-xl font-bold dark:text-white bg-transparent border-none focus:outline-none placeholder-gray-400"
        placeholder="Note Title"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        placeholder="Start typing your note..."
      />
    </div>
  );
};

export default NoteEditorPage;