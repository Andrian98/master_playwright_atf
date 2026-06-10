const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
    if (value === undefined) {
        return defaultValue;
    }

    return value.toLowerCase() === 'true';
};

export const environment = {
    name: 'test',
    baseUrl: 'https://parabank.parasoft.com/parabank',
    apiBaseUrl: 'https://parabank.parasoft.com/parabank/services/bank',
    loginPath: '/index.htm',
    adminPath: '/admin.htm',
    registerPath: '/register.htm',
    authStatePath: 'playwright/.auth/user.json',
    openNewAccountPath: '/openaccount.htm',
    transferFundsPath: '/transfer.htm',
    accountOverviewPath: '/overview.htm',
    requestLoanPath: '/requestloan.htm',
    captureCheckpointScreenshots: parseBoolean(process.env.CAPTURE_CHECKPOINT_SCREENSHOTS, false),
};
