import axiosInstance from "@/config/axios/axiosInstance";
import { CreateNotePayload, CreateNoteResponse, GetNotesResponse, UpdateNotePayload, UpdateNoteResponse, DeleteNoteResponse, GetNoteByIdResponse } from "../../apiTypes/types";

export const createNoteApi = async (data: CreateNotePayload): Promise<CreateNoteResponse> => {
    const response = await axiosInstance.post("/notes/create", data);
    return response.data;
};

export const getNotesByUserApi = async (): Promise<GetNotesResponse> => {
    const response = await axiosInstance.get("/notes/getNotes/byUser");
    return response.data;
};

export const getNoteByIdApi = async (id: number): Promise<GetNoteByIdResponse> => {
    const response = await axiosInstance.get(`/notes/${id}`);
    return response.data;
};

export const updateNoteApi = async (id: number, data: UpdateNotePayload): Promise<UpdateNoteResponse> => {
    const response = await axiosInstance.post(`/notes/update/${id}`, data);
    return response.data;
};

export const deleteNoteApi = async (id: number): Promise<DeleteNoteResponse> => {
    const response = await axiosInstance.delete(`/notes/delete/${id}`);
    return response.data;
};
