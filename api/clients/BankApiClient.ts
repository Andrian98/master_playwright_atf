import {APIRequestContext, APIResponse} from "@playwright/test";
import {environment} from "../../config/environment";
import {logger} from "../../utils/logger";
import {redactHeaders, redactText, redactUrl} from "../../utils/redactionHelper";

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

    async get(endpoint: string): Promise<APIResponse> {
        const url = `${environment.apiBaseUrl}${endpoint}`;
        const headers = {'accept': 'application/json'};
        this.lastRequestData = {
            url: redactUrl(url),
            method: 'GET',
            headers: redactHeaders(headers),
            postData: null
        };
        const response = await this.request.get(url, {headers});
        this.lastResponse = response;
        logger.info(`API GET ${redactUrl(endpoint)} completed with status ${response.status()}`);
        return response;
    }

    async post(endpoint: string, body?: unknown): Promise<APIResponse> {
        const url = `${environment.apiBaseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        };
        this.lastRequestData = {
            url: redactUrl(url),
            method: 'POST',
            headers: redactHeaders(headers),
            postData: body ? redactText(JSON.stringify(body, null, 2)) : null
        };

        const response = await this.request.post(url, {data: body, headers});
        this.lastResponse = response;
        logger.info(`API POST ${redactUrl(endpoint)} completed with status ${response.status()}`);
        return response;
    }

    public getLastResponse(): APIResponse | null {
        return this.lastResponse;
    }

    public getLastRequestData(): LastRequestData | null {
        return this.lastRequestData;
    }
}
