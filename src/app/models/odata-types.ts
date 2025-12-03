export interface AuthResponse {
  d: {
    Empid: string;
    Password?: string;
    Success: boolean;
    Message: string;
    Fullname: string;
  }
}

export interface EmployeeProfile {
  Pernr: string;
  Fullname: string;
  Gender: string;
  Dob: string;       // OData dates come as strings
  Designation: string;
  Department: string;
  Email: string;
  JoinDate: string;
}

export interface LeaveRequest {
  RequestId?: string; // Optional for new requests
  Pernr: string;
  LeaveType: string;
  LeaveText: string;
  Begda: string;
  Endda: string;
  DaysP: string;      // XML says Decimal, comes as string in JSON
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
  PdfContent: string;
}

// Helper wrapper for OData Lists (standard SAP format)
export interface ODataListResponse<T> {
  d: {
    results: T[];
  }
}

export interface ODataSingleResponse<T> {
  d: T;
}