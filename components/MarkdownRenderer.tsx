import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
    content: string;
    className?: string;
    isDark?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '', isDark = false }) => {
    return (
        <div className={`markdown-content ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={isDark ? atomDark : prism}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-lg my-4"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={`${className} bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono`} {...props}>
                                {children}
                            </code>
                        );
                    },
                    h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-900 dark:text-white">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2 text-gray-900 dark:text-white">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-base font-medium mt-3 mb-2 text-gray-900 dark:text-white">{children}</h4>,
                    p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-gray-700 dark:text-gray-300">{children}</ol>,
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary-500 pl-4 py-1 my-4 italic bg-gray-50 dark:bg-gray-800/50 rounded-r">
                            {children}
                        </blockquote>
                    ),
                    hr: () => <hr className="my-8 border-gray-200 dark:border-gray-700" />,
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 hover:underline">
                            {children}
                        </a>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>,
                    th: ({ children }) => <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>,
                    td: ({ children }) => <td className="px-4 py-2 whitespace-nowrap text-sm border-t border-gray-200 dark:border-gray-700">{children}</td>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
