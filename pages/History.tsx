import React from 'react';
import { Clock, ExternalLink, Trash2, Link as LinkIcon } from 'lucide-react';

interface HistoryItem {
  id: string;
  originalText: string;
  summary: string;
  timestamp: Date;
  sourceUrl?: string;
  sourceTitle?: string;
}

const HistoryPage = () => {
  // Mock data
  const history: HistoryItem[] = [
    { 
      id: '1', 
      originalText: 'This is the original text that was summarized...', 
      summary: 'This is the AI-generated summary of the text.', 
      timestamp: new Date('2024-01-15T10:30:00'),
      sourceUrl: 'https://example.com',
      sourceTitle: 'Example Source'
    },
    { 
      id: '2', 
      originalText: 'Another piece of text for summarization...', 
      summary: 'Summary of the second text item.', 
      timestamp: new Date('2024-01-14T14:45:00')
    },
  ];

  const clearHistory = () => {
    if(confirm('Clear all history?')) {
      console.log('History cleared');
    }
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

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No history yet</p>
          </div>
        ) : (
          history.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {item.timestamp.toLocaleString()}
                </span>
                {item.sourceUrl && (
                  <a 
                    href={item.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    Source
                  </a>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-1">Original</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.originalText}</p>
                </div>
                
                <div className="pl-3 border-l-2 border-primary-500">
                  <h4 className="text-xs uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">Summary</h4>
                  <p className="text-gray-800 dark:text-gray-200 text-sm line-clamp-3">{item.summary}</p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button className="text-xs flex items-center gap-1 text-primary-600 hover:underline">
                  View Full <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;