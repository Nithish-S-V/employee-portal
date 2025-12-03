// Wrapper for OData Lists (d.results)
export interface ODataListResponse<T> {
    d: {
        results: T[];
    };
}

// Wrapper for Single Objects (d)
export interface ODataSingleResponse<T> {
    d: T;
}

export interface AuthResponse {
    Empid: string;
    Password?: string;
    Success: boolean;
    Message: string;
    Fullname: string;
}

export interface Employee {
    Pernr: string;
    Fullname: string;
    Gender: string;
    Dob: string; // SAP Date Format /Date(888...)/
    Designation: string;
    Department: string;
    Email: string;
    JoinDate: string;
}

export interface LeaveRequest {
    RequestId: string;
    Pernr: string;
    LeaveType: string;
    LeaveText: string;
    Begda: string;
    Endda: string;
    DaysP: string;
    Status: string;
}

export interface LeaveBalance {
    Pernr: string;
    QuotaType: string;
    QuotaText: string;
    Entitlement: string;
    Deduction: string;
    Balance: string;
}

export interface Payslip {
    Pernr: string;
    PayYear: string;
    PayMonth: string;
    NetPay: string;
    Currency: string;
    PdfContent: string; // Base64
}