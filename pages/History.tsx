import React, { useState, useEffect } from 'react';
import { Clock, Loader2, X } from 'lucide-react';
import { getHistoryByUserIdApi } from '../services/api/historyApi';
import { HistoryData } from '../apiTypes/types';

const HistoryPage = () => {
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<HistoryData | null>(null);

  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getHistoryByUserIdApi();
        setHistory(response.data);
      } catch (err: any) {
        console.error('Error fetching history:', err);
        const errorMessage = err?.response?.data?.message || 'Failed to load history. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const clearHistory = () => {
    if (confirm('Clear all history?')) {
      console.log('History cleared');
      // TODO: Implement clear history API call
    }
  };

  const openModal = (item: HistoryData) => {
    setSelectedHistory(item);
  };

  const closeModal = () => {
    setSelectedHistory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          History
        </h2>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-3 py-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Loading history...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* History List */}
      {!loading && !error && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No history yet</p>
            </div>
          ) : (
            history.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {formatDate(item.createdAt)}
                  </span>
                  <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded">
                    {item.type}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-1">Prompt</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{item.prompt}</p>
                  </div>

                  <div className="pl-3 border-l-2 border-primary-500">
                    <h4 className="text-xs uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">Result</h4>
                    <p className="text-gray-800 dark:text-gray-200 text-sm line-clamp-4 whitespace-pre-wrap">{item.result}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <button
                    onClick={() => openModal(item)}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline"
                  >
                    View Full →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">History Details</h3>
                <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded">
                  {selectedHistory.type}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-4 space-y-4">
              <div>
                <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {formatDate(selectedHistory.createdAt)}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Prompt</h4>
                <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                  {selectedHistory.prompt}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-2">Result</h4>
                <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-3 rounded whitespace-pre-wrap">
                  {selectedHistory.result}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;