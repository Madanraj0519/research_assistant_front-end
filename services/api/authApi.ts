import axiosInstance from "@/config/axios/axiosInstance";
import { AuthResponse, LoginPayload, LoginResponse, RegisterPayload, LogoutResponse} from "../../apiTypes/types";


export const loginApi = async(data: LoginPayload): Promise<LoginResponse> => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
};

export const registerApi = async(data: RegisterPayload) : Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
}

export const logoutApi = async(id : number) : Promise<LogoutResponse> => {
    const response = await axiosInstance.post(`/auth/logout/${id}`);
    return response.data;
};