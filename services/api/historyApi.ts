import axiosInstance from "@/config/axios/axiosInstance";
import { GetHistoryResponse } from "../../apiTypes/types";

export const getHistoryByUserIdApi = async (): Promise<GetHistoryResponse> => {
    const response = await axiosInstance.get("/history/getByUserId");
    return response.data;
};
