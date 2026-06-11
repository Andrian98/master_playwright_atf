export const bankEndpoints = {
    login: (username: string, password: string): string => `/login/${username}/${password}`,

    createAccount: (customerId: number, newAccountType: number, fromAccountId: number): string =>
        `/createAccount?customerId=${customerId}&newAccountType=${newAccountType}&fromAccountId=${fromAccountId}`,

    getAccounts: (customerId: number): string => `/customers/${customerId}/accounts`,
};
