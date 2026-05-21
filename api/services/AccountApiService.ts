import {BankApiClient} from "../clients/BankApiClient";
import {APIResponse} from "@playwright/test";

export class AccountApiService {
    private readonly apiClient: BankApiClient;

    constructor(apiClient: BankApiClient) {
        this.apiClient = apiClient;
    }

    async login(username: string, password: string): Promise<APIResponse> {
        const loginUrl = `/login/${username}/${password}`;
        return await this.apiClient.get(loginUrl);
    }

    async createAccount(customerId: number, newAccountType: number, fromAccountId: number): Promise<APIResponse> {
        const createAccountUrl = `/createAccount?customerId=${customerId}&newAccountType=${newAccountType}&fromAccountId=${fromAccountId}`;
        return await this.apiClient.post(createAccountUrl);
    }

    async getAccounts(customerId: number): Promise<APIResponse> {
        const accountsUrl = `/customers/${customerId}/accounts`;
        return await this.apiClient.get(accountsUrl);
    }
}