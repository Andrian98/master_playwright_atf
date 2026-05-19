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
    }
};