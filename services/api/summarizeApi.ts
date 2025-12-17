import axiosInstance from "@/config/axios/axiosInstance";
import { summarizeResponse } from "../../apiTypes/types";

export const summarizeApi = async(text: string) : Promise<summarizeResponse> => {
    const response = await axiosInstance.post("/ai/summary", { content : text });
    return response.data;
}