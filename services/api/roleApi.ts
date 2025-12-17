import axiosInstance from "@/config/axios/axiosInstance";
import { AllRoleResponse } from "../../apiTypes/types";

export const allRolesApi = async() : Promise<AllRoleResponse> => {
    const response = await axiosInstance.get("/roles");
    return response.data;
};
