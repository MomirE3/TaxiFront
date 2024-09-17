export enum AuthType {
    TRADITIONAL = 0,
    GOOGLE = 1
}

export interface LoginData{
    Email: string;
    Password?: string;
    authType: AuthType;
}