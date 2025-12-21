/**
 * Generates a clean title from the given content.
 * It follows the logic:
 * 1. Find the first meaningful text (excluding markdown headers #)
 * 2. Return everything up to the first full stop (.)
 * 3. Enforce a max length of 100 characters for title safety.
 */
export const generateTitleFromContent = (content: string): string => {
    if (!content) return 'Untitled Note';

    // 1. Get lines and filter for content
    const lines = content.split('\n');
    let firstMeaningfulText = '';

    for (const line of lines) {
        const clean = line.replace(/^[#\s\*_\->]+/, '').trim();
        if (clean.length > 0) {
            firstMeaningfulText = clean;
            break;
        }
    }

    if (!firstMeaningfulText) return 'Untitled Note';

    // 2. Find the first full stop
    const firstStopIndex = firstMeaningfulText.indexOf('.');

    let title = firstMeaningfulText;
    if (firstStopIndex !== -1 && firstStopIndex > 3) {
        title = firstMeaningfulText.substring(0, firstStopIndex + 1);
    }

    // 3. Clean up formatting and trim to length
    title = title.replace(/[*_`]/g, '').trim();

    if (title.length > 100) {
        title = title.substring(0, 97).trim() + '...';
    }

    return title || 'Untitled Note';
};
