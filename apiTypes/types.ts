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
export interface user{
    id: number
    created: string
    username?: string
    email : string
    lastLoginAt: string
    role : Role
    status : true
    token : string
}

export interface UserResponse {
    success: boolean;
    message: string;
    data: user;
}


// roles

export interface Role{
        id : number,
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

export interface summarizeResponse{
    success: boolean;
    message: string;
    data: string;
}