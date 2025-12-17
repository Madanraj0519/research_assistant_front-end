export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: number | string;
}


export interface LoginResponse {
  success: boolean;
  message: string;
  data: user;
};

export interface LogoutResponse {
  success: boolean;
  message: string;
};

export interface AuthResponse {
  success: boolean;
  message: string;
  data: any;
}


// user
export interface user {
  id: number
  created: string
  username?: string
  email: string
  lastLoginAt: string
  role: Role
  status: true
  token: string
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: user;
}


// roles

export interface Role {
  id: number,
  roleName: string,
  icon: string,
  roleDescription: string,
  searchBehavior: string,
  promptTemplate: string
}


export interface AllRoleResponse {
  success: boolean;
  message: string;
  data: Role[];
}

export interface summarizeResponse {
  success: boolean;
  message: string;
  data: string;
}

// Notes
export interface CreateNotePayload {
  title: string;
  content: string;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
}

export interface NoteData {
  id: number;
  title: string;
  content: string;
  userId: number;
  createdAt: string;
  updatedAt: string | null;
  favorite: boolean;
}

export interface CreateNoteResponse {
  success: boolean;
  message: string;
  data: NoteData;
}

export interface UpdateNoteResponse {
  success: boolean;
  message: string;
  data: NoteData;
}

export interface DeleteNoteResponse {
  success: boolean;
  message: string;
}

export interface GetNotesResponse {
  status: string;
  message: string;
  data: NoteData[];
}

export interface GetNoteByIdResponse {
  success: boolean;
  message: string;
  data: NoteData;
}

// History
export interface HistoryData {
  id: number;
  userId: number;
  type: string;
  prompt: string;
  result: string;
  createdAt: string;
}

export interface GetHistoryResponse {
  status: string;
  message: string;
  data: HistoryData[];
}