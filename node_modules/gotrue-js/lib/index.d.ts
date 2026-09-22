import API, { type RequestOptions } from './api';
import User, { type Token } from './user';
export type { Token, AppMetadata } from './user';
export type { UserData, UserAttributes } from './admin';
export { default as User } from './user';
export { default as Admin } from './admin';
export { HTTPError, JSONHTTPError, TextHTTPError } from './api';
export interface GoTrueInit {
    APIUrl?: string;
    audience?: string;
    setCookie?: boolean;
    clientName?: string;
}
export interface Settings {
    autoconfirm: boolean;
    disable_signup: boolean;
    external: {
        bitbucket: boolean;
        email: boolean;
        facebook: boolean;
        github: boolean;
        gitlab: boolean;
        google: boolean;
    };
}
export interface SignupResponse {
    id: string;
    email: string;
    confirmation_sent_at?: string;
    confirmed_at?: string;
    [key: string]: unknown;
}
export default class GoTrue {
    audience?: string;
    setCookie: boolean;
    api: API;
    constructor({ APIUrl, audience, setCookie, clientName, }?: GoTrueInit);
    _request<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
    settings(): Promise<Settings>;
    signup(email: string, password: string, data?: Record<string, unknown>): Promise<SignupResponse>;
    login(email: string, password: string, remember?: boolean): Promise<User>;
    loginExternalUrl(provider: string): string;
    confirm(token: string, remember?: boolean): Promise<User>;
    requestPasswordRecovery(email: string): Promise<void>;
    recover(token: string, remember?: boolean): Promise<User>;
    acceptInvite(token: string, password: string, remember?: boolean): Promise<User>;
    acceptInviteExternalUrl(provider: string, token: string): string;
    createUser(tokenResponse: Token, remember?: boolean): Promise<User>;
    currentUser(): User | null;
    validateCurrentSession(): Promise<User | null>;
    verify(type: string, token: string, remember?: boolean): Promise<User>;
    _setRememberHeaders(remember?: boolean): void;
}
declare global {
    interface Window {
        GoTrue: typeof GoTrue;
    }
}
