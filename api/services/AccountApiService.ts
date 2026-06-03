import {BankApiClient} from "../clients/BankApiClient";
import {APIResponse} from "@playwright/test";
import {Customer} from "../models/Customer";
import {Account} from "../models/Account";

export class AccountApiService {
    public readonly apiClient: BankApiClient;

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

    async getCustomerId(username: string, password: string): Promise<number> {
        const loginResponse = await this.login(username, password);
        if (loginResponse.status() !== 200) {
            throw new Error(`Failed to log in to fetch Customer ID. Status: ${loginResponse.status()}`);
        }
        const loginJson: Customer = await loginResponse.json();
        return loginJson.id;
    };

    async getFirstAccountId(customerId: number): Promise<number> {
        const getAccountId = await this.getAccounts(customerId);
        if (getAccountId.status() !== 200) {
            throw new Error(`Failed to retrieve accounts for customer ID ${customerId}. Status code: ${getAccountId.status()}`);
        }
        const accounts: Account[] = await getAccountId.json();
        if (accounts.length === 0) {
            throw new Error('No accounts found for the customer. Please ensure the customer has at least one account before running this test.');
        }
        return accounts[0]!.id;
    }
}