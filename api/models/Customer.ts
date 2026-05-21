export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface Customer {
    id: number;
    firstName: string;
    lastName: string;
    address: Address;
    phoneNumber: string;
    ssn: string;
}