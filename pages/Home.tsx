import { useState, useEffect, useRef } from 'react';
import { Sparkles, Copy, FilePlus, Check, Link as LinkIcon, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useSummarize } from "../hooks/useSummarize"
import { createNoteApi } from "../services/api/notesApi";

const HomePage = () => {
  const [input, setInput] = useState('');
  interface SourceInfo {
    title?: string;
    url?: string;
    trigger?: string;
  }

  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasPendingContext, setHasPendingContext] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isListening, setIsListening] = useState(true);
  const [sourceInfo, setSourceInfo] = useState<SourceInfo | null>(null);
  const [autoSelectionMode, setAutoSelectionMode] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState('200px');
  const navigate = useNavigate();
  const refreshIntervalRef = useRef<number | any>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { summarize, error } = useSummarize();

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true);
    setWindowWidth(window.innerWidth);

    // Set initial textarea height based on window height
    const calculateHeight = () => {
      const windowHeight = window.innerHeight;
      // Reserve 40% of window height for textarea on desktop, 35% on mobile
      const height = windowHeight * (window.innerWidth < 640 ? 0.35 : 0.4);
      setTextareaHeight(`${Math.max(200, height)}px`);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);

    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  // Auto-adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set new height based on content, with a minimum
      const newHeight = Math.max(
        parseFloat(textareaHeight),
        textareaRef.current.scrollHeight
      );
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input, textareaHeight]);

  // Initialize and load pending context
  useEffect(() => {
    console.log("🏠 Home page loading - checking for pending context");

    loadPendingContext();

    // Set up listener for new selections
    startListeningForSelections();

    // Set up storage change listener
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const handleStorageChange: any = (
        changes: { [key: string]: chrome.storage.StorageChange },
        namespace: "local" | "sync" | "managed"
      ) => {
        if (namespace === 'local' && changes.pendingContext) {
          console.log("🔄 Storage change detected");
          loadPendingContext();
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);

      // Cleanup
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
        if (refreshIntervalRef.current) {
          window.clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, []);

  // Function to load pending context
  const loadPendingContext = async () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        const result = await chrome.storage.local.get(['pendingContext']);
        console.log("📦 Storage result:", result);

        if (result.pendingContext) {
          console.log("✅ Found pending context:", {
            textLength: result.pendingContext.text?.length,
            source: result.pendingContext.sourceTitle,
            trigger: result.pendingContext.trigger
          });

          setInput(result.pendingContext.text);
          setHasPendingContext(true);

          // Set source info
          if (result.pendingContext.sourceTitle || result.pendingContext.sourceUrl) {
            setSourceInfo({
              title: result.pendingContext.sourceTitle,
              url: result.pendingContext.sourceUrl,
              trigger: result.pendingContext.trigger
            });
          }

          // Clear the badge if it exists
          try {
            await chrome.action.setBadgeText({ text: "" });
          } catch (error) {
            console.log("Could not clear badge:", error);
          }
        } else {
          console.log("ℹ️ No pending context found");
          setHasPendingContext(false);
          setSourceInfo(null);
        }
      } catch (error) {
        console.error('Error loading context:', error);
      }
    } else {
      console.log("⚠️ Chrome API not available");
    }
  };

  // Start listening for new text selections
  const startListeningForSelections = () => {
    if (typeof chrome !== 'undefined') {
      setIsListening(true);

      // Check for new selections every 1 second when auto-selection is enabled
      if (autoSelectionMode) {
        refreshIntervalRef.current = setInterval(() => {
          loadPendingContext();
        }, 1000);
      }
    }
  };

  // Toggle auto-selection mode
  const toggleAutoSelection = () => {
    const newMode = !autoSelectionMode;
    setAutoSelectionMode(newMode);

    if (newMode) {
      // If enabling, start listening
      startListeningForSelections();
    } else {
      // If disabling, stop listening
      if (refreshIntervalRef.current) {
        window.clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      setIsListening(false);
    }
  };

  // Function to manually refresh context
  const refreshContext = async () => {
    console.log("🔃 Manually refreshing context...");
    await loadPendingContext();
  };

  // Function to clear context from storage
  const clearContextFromStorage = async () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        // Clear from storage
        await chrome.storage.local.remove(['pendingContext']);

        // Also send message to background to clear badge
        await chrome.runtime.sendMessage({
          type: 'CLEAR_CONTEXT'
        });

        console.log("🗑️ Context cleared from storage");

        // Update local state
        setInput('');
        setHasPendingContext(false);
        setSourceInfo(null);
      } catch (error) {
        console.error('Error clearing context:', error);
      }
    }
  };

  const isMobile = isClient && windowWidth < 640;

  const handleSummarize = async () => {

    if (!input.trim()) return;

    setIsLoading(true);
    setSummary('');
    setSaved(false);

    try {
      // Mock API call - replace with actual Gemini API
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await summarize(input);

      console.log("🤖 Summarization response:", response);
      if (response) {
        setSummary(response);
        setInput('');
      } else {
        setSummary("No summary returned from the AI service.");
      }

      // Clear context after summarizing
      await clearContextFromStorage();

    } catch (err) {
      console.error(err);
      setSummary("An error occurred while communicating with the AI service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  console.log("summarize", summarize);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = async () => {
    if (!summary.trim()) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Generate title from source info or timestamp
      let title = '';
      if (sourceInfo?.title) {
        title = sourceInfo.title;
      } else {
        // Use timestamp as fallback
        const now = new Date();
        title = `Summary - ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
      }

      // Call API to save note
      const response = await createNoteApi({
        title: title,
        content: summary
      });

      console.log('Note saved successfully:', response);

      // Show success feedback
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      // Navigate to notes page after a short delay
      setTimeout(() => {
        navigate('/notes');
      }, 1000);

    } catch (err: any) {
      console.error('Error saving note:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to save note. Please try again.';
      setSaveError(errorMessage);

      // Clear error after 5 seconds
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const clearInput = () => {
    setInput('');
    setSummary('');
    setHasPendingContext(false);
    setSourceInfo(null);
    clearContextFromStorage();

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = textareaHeight;
    }
  };

  // Don't render until client-side
  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="mb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
            Summarize Content
          </h2>
          <div className="flex items-center gap-2">
            {hasPendingContext && (
              <span className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                <span>Live</span>
              </span>
            )}
            <button
              onClick={refreshContext}
              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-md transition-colors"
              title="Refresh selected text"
            >
              <RefreshCw className={`w-3 h-3 ${isListening ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {hasPendingContext
            ? "Text selected on webpage will auto-appear here. Select more text to update."
            : "Select text on any webpage or paste text below to get an AI-powered summary."}
        </p>
      </header>

      {/* Auto-selection Toggle */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${autoSelectionMode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-selection {autoSelectionMode ? 'Active' : 'Paused'}
            </span>
          </div>
          <button
            onClick={toggleAutoSelection}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${autoSelectionMode
              ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
          >
            {autoSelectionMode ? 'Pause' : 'Resume'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {autoSelectionMode
            ? 'Text selection on webpages will automatically appear here'
            : 'Auto-selection paused. Select text and use the floating button or right-click menu.'}
        </p>
      </div>

      {/* Text Input Area - Now Much Taller */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow border border-gray-200 dark:border-gray-700 relative overflow-hidden">
        {hasPendingContext && autoSelectionMode && (
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
        )}

        <div className="relative">
          <textarea
            ref={textareaRef}
            placeholder={autoSelectionMode
              ? "Select text on any webpage, or paste text here..."
              : "Paste text here or use right-click menu to summarize..."}
            style={{
              minHeight: textareaHeight,
              height: textareaHeight
            }}
            className="w-full p-3 sm:p-4 bg-transparent text-gray-900 dark:text-white border-none focus:ring-0 resize-y outline-none pt-10 sm:pt-12 text-sm sm:text-base"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {input && (
            <button
              onClick={clearInput}
              className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors z-10"
              title="Clear text"
            >
              ✕
            </button>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            {input.length} characters • {Math.ceil(input.length / 5)} estimated words
            {isListening && autoSelectionMode && (
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 dark:text-green-400">Listening</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={clearInput}
              className="flex-1 sm:flex-none px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              Clear
            </button>
            <button
              onClick={handleSummarize}
              disabled={!input.trim() || isLoading}
              className="flex-1 sm:flex-none px-4 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isMobile ? 'Analyzing' : 'Analyzing...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {isMobile ? 'Summarize' : 'Summarize'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions - Only show when textarea is empty */}
      {!input.trim() && !hasPendingContext && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
              <Search className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                How to use Research Assistant
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">1.</span>
                  <span>Navigate to any webpage and select text with your mouse</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">2.</span>
                  <span>Use the floating "Summarize" button or right-click menu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">3.</span>
                  <span>Selected text automatically appears here (when auto-selection is on)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">4.</span>
                  <span>Click "Summarize" to get AI-powered analysis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {
        error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )
      }

      {/* Summary Output */}
      {summary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow border border-primary-200 dark:border-primary-800 p-3 sm:p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
              AI Summary
            </h3>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={handleCopy}
                className="p-1 sm:p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-md transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
              </button>
              <button
                onClick={handleSaveNote}
                className="p-1 sm:p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-md transition-colors"
                title="Save as Note"
              >
                {saved ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <FilePlus className="w-3 h-3 sm:w-4 sm:h-4" />}
              </button>
            </div>
          </div>
          {saveError && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
              {saveError}
            </div>
          )}
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-xs sm:text-sm max-h-96 overflow-y-auto">
            <p className="whitespace-pre-wrap">{summary}</p>
          </div>


          {!isMobile && (
            <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={handleSaveNote}
                className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
              >
                Create Note from Summary
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile-only quick action buttons */}
      {isMobile && summary && (
        <div className="flex gap-2">
          <button
            onClick={handleSaveNote}
            disabled={isSaving}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FilePlus className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Note'}
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;