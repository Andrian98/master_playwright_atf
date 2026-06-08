import {APIRequestContext, APIResponse} from "@playwright/test";
import {environment} from "../../config/environment";
import {logger} from "../../utils/logger";

export interface LastRequestData {
    url: string;
    method: string;
    headers: Record<string, string>;
    postData: string | null;
}

export class BankApiClient {
    private readonly request: APIRequestContext;
    private lastResponse: APIResponse | null = null;
    private lastRequestData: LastRequestData | null = null;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    private sanitizeEndpoint(endpoint: string): string {
        return endpoint.replace(/\/login\/([^/]+)\/[^/?#]+/, '/login/$1/[REDACTED]');
    }

    async get(endpoint: string): Promise<APIResponse> {
        const url = `${environment.apiBaseUrl}${endpoint}`;
        const headers = {'accept': 'application/json'};
        this.lastRequestData = {
            url,
            method: 'GET',
            headers,
            postData: null
        };
        const response = await this.request.get(url, {headers});
        this.lastResponse = response;
        logger.info(`API GET ${this.sanitizeEndpoint(endpoint)} completed with status ${response.status()}`);
        return response;
    }

    async post(endpoint: string, body?: unknown): Promise<APIResponse> {
        const url = `${environment.apiBaseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        };
        this.lastRequestData = {
            url,
            method: 'POST',
            headers,
            postData: body ? JSON.stringify(body, null, 2) : null
        };

        const response = await this.request.post(url, {data: body, headers});
        this.lastResponse = response;
        logger.info(`API POST ${this.sanitizeEndpoint(endpoint)} completed with status ${response.status()}`);
        return response;
    }

    public getLastResponse(): APIResponse | null {
        return this.lastResponse;
    }

    public getLastRequestData(): LastRequestData | null {
        return this.lastRequestData;
    }
}
