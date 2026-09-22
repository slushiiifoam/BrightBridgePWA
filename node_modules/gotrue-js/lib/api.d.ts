export declare class HTTPError extends Error {
    status: number;
    constructor(response: Response);
}
export declare class TextHTTPError extends HTTPError {
    data: string;
    constructor(response: Response, data: string);
}
export declare class JSONHTTPError extends HTTPError {
    json: {
        msg?: string;
        error?: string;
        error_description?: string;
    };
    constructor(response: Response, json: Record<string, unknown>);
}
export interface RequestOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    credentials?: RequestCredentials;
    audience?: string;
}
export default class API {
    apiURL: string;
    defaultHeaders: Record<string, string>;
    private _sameOrigin;
    constructor(apiURL?: string, options?: {
        defaultHeaders?: Record<string, string>;
    });
    private headers;
    private static parseJsonResponse;
    request<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
}
