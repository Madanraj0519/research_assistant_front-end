import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Tag } from 'lucide-react';

const NoteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>(['Research', 'AI']);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (id && id !== 'new') {
      // Load existing note
      setTitle('Research Note Title');
      setContent('Write your note content here...');
    }
  }, [id]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    
    const finalTitle = title.trim() || 'Untitled Note';
    console.log('Saving note:', { id, title: finalTitle, content, tags });
    navigate('/notes');
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

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
          {id === 'new' ? 'New Note' : 'Edit Note'}
        </h1>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-xl font-bold dark:text-white bg-transparent border-none focus:outline-none placeholder-gray-400"
        placeholder="Note Title"
      />

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm"
          >
            <Tag className="w-3 h-3" />
            <span>{tag}</span>
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-primary-800 dark:hover:text-primary-300"
            >
              ×
            </button>
          </div>
        ))}
        <div className="flex items-center">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add tag..."
            className="px-3 py-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500 text-sm w-24"
          />
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        placeholder="Start typing your note..."
      />

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">AI</span>
          </div>
          <span className="font-medium dark:text-white">AI Suggestions</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Consider adding more details about your research methodology and key findings.
        </p>
        <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
          Apply suggestion →
        </button>
      </div>
    </div>
  );
};

export default NoteEditorPage;