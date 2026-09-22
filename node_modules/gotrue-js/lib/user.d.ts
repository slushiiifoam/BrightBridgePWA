import Admin from './admin';
import API, { type RequestOptions } from './api';
export interface Token {
    access_token: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    token_type: 'bearer';
}
export interface AppMetadata {
    provider: string;
    roles?: string[];
    [key: string]: unknown;
}
export default class User {
    api: API;
    url: string;
    audience: string;
    token: Token | null;
    _fromStorage?: boolean;
    id: string;
    aud: string;
    email: string;
    role: string;
    app_metadata: AppMetadata;
    user_metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    confirmed_at: string | null;
    new_email?: string;
    [key: string]: unknown;
    constructor(api: API, tokenResponse: Token, audience: string);
    static removeSavedSession(): void;
    static recoverSession(apiInstance?: API): User | null;
    get admin(): Admin;
    update(attributes: Record<string, unknown>): Promise<User>;
    jwt(forceRefresh?: boolean): Promise<string>;
    logout(): Promise<void>;
    _refreshToken(refresh_token: string): Promise<string>;
    _request<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
    getUserData(): Promise<User>;
    _saveUserData(attributes: Record<string, unknown>, fromStorage?: boolean): User;
    _processTokenResponse(tokenResponse: Token): void;
    _refreshSavedSession(): User;
    get _details(): Record<string, unknown>;
    _saveSession(): User;
    tokenDetails(): Token | null;
    clearSession(): void;
}
