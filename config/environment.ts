const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
    if (value === undefined) {
        return defaultValue;
    }

    return value.toLowerCase() === 'true';
};

const parsePositiveInteger = (value: string | undefined, defaultValue: number): number => {
    if (value === undefined) {
        return defaultValue;
    }

    const parsedValue = Number(value);
    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        return defaultValue;
    }

    return parsedValue;
};

const parseResourceMonitoringSource = (value: string | undefined): 'local' => {
    if (value === undefined || value.toLowerCase() === 'local') {
        return 'local';
    }

    throw new Error(`Unsupported RESOURCE_MONITORING_SOURCE value: ${value}. Supported values: local.`);
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
    resourceMonitoring: {
        enabled: parseBoolean(process.env.RESOURCE_MONITORING_ENABLED, true),
        source: parseResourceMonitoringSource(process.env.RESOURCE_MONITORING_SOURCE),
        intervalMs: parsePositiveInteger(process.env.RESOURCE_MONITORING_INTERVAL_MS, 1000),
        chartLabelIntervalSeconds: parsePositiveInteger(process.env.RESOURCE_MONITORING_CHART_LABEL_INTERVAL_SECONDS, 5),
    },
};
