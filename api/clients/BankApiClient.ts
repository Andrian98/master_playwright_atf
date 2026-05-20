import {APIRequestContext, APIResponse} from "@playwright/test";
import {environment} from "../../config/environment";


export class BankApiClient {
    private readonly request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    async get(endpoint: string): Promise<APIResponse> {
        const url = `${environment.baseUrl}${environment.apiBasePath}${endpoint}`;
        return await this.request.get(url);
    }

    async post(endpoint: string, body?: unknown): Promise<APIResponse>{
        const url = `${environment.baseUrl}${environment.apiBasePath}${endpoint}`;
        return await this.request.post(url, {
            data: body,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}