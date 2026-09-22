import type User from './user';
import type { AppMetadata } from './user';
export interface UserData {
    id: string;
    aud: string;
    email: string;
    role: string;
    app_metadata: AppMetadata;
    user_metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    confirmed_at: string | null;
    [key: string]: unknown;
}
export interface UserAttributes {
    email?: string;
    password?: string;
    [key: string]: unknown;
}
export default class Admin {
    private user;
    constructor(user: User);
    listUsers(aud: string): Promise<UserData[]>;
    getUser(user: UserData): Promise<UserData>;
    updateUser(user: UserData, attributes?: UserAttributes): Promise<UserData>;
    createUser(email: string, password: string, attributes?: UserAttributes): Promise<UserData>;
    deleteUser(user: UserData): Promise<void>;
}
