import { useState } from "react";
import { summarizeApi } from "../services/api/summarizeApi";

export const useSummarize = () => {

        const [loading, setLoading] = useState<boolean>(false);
        const [error, setError] = useState<string | null>(null);

        const summarize = async(text: string) => {
            try {
                setLoading(true);
                const response = await summarizeApi(text);
                setLoading(false);
                return response.data;
            } catch (error) {
                console.error("Summarization error:", error);
                setError("Summarization failed. Please try again.");
                setLoading(false);
            }
        };

        return { summarize, loading, error };
};