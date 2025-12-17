import axiosInstance from "@/config/axios/axiosInstance";
import { UserResponse } from "../../apiTypes/types";


export const getUser = async(id: number): Promise<UserResponse> => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
}