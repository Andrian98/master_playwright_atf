export const loanData = {
    validLoanRequest: {
        amount: '500',
        downPayment: '100',
        expectedStatus: 'Approved'
    },
    highRiskLoanRequest: {
        amount: '500000',
        downPayment: '10',
        expectedStatus: 'Denied'
    }
};

export const accountData = {
    checking: {
        type: 'CHECKING',
        initialDeposit: '100'
    },
    savings: {
        type: 'SAVINGS',
        initialDeposit: '1000'
    },

    apiChecking: {
        type: 0,
        label: 'CHECKING',
    },

    apiSavings: {
        type: 1,
        label: 'SAVINGS',
    },

    apiLoan: {
        type: 2,
        label: 'LOAN',
    },

    invalidCustomerId: {
        customerId: 11111,
    },

};