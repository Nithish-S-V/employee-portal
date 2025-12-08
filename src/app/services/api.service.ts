import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ODataSingleResponse,
  ODataListResponse,
  Employee,
  LeaveRequest,
  LeaveBalance,
  Payslip
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/sap/opu/odata/sap/ZEMP_PORTAL_863_SRV';
  private httpWithoutInterceptors: HttpClient;

  constructor(private http: HttpClient, private handler: HttpBackend) {
    // Create specific HttpClient that bypasses all interceptors (no CSRF token added)
    this.httpWithoutInterceptors = new HttpClient(handler);
  }

  getEmployeeProfile(pernr: string): Observable<ODataSingleResponse<Employee>> {
    return this.http.get<ODataSingleResponse<Employee>>(`${this.baseUrl}/EmployeeSet('${pernr}')`);
  }

  getLeaveHistory(pernr: string): Observable<ODataListResponse<LeaveRequest>> {
    return this.http.get<ODataListResponse<LeaveRequest>>(`${this.baseUrl}/LeaveRequestSet?$filter=Pernr eq '${pernr}'`);
  }

  getLeaveBalances(pernr: string): Observable<ODataListResponse<LeaveBalance>> {
    return this.http.get<ODataListResponse<LeaveBalance>>(`${this.baseUrl}/LeaveBalanceSet?$filter=Pernr eq '${pernr}'`);
  }

  getPayslip(pernr: string, year: string, month: string): Observable<ODataSingleResponse<Payslip>> {
    return this.http.get<ODataSingleResponse<Payslip>>(
      `${this.baseUrl}/PayslipSet(Pernr='${pernr}',PayYear='${year}',PayMonth='${month}')`
    );
  }
  // 6. APPLY LEAVE (POST)
  applyLeave(payload: any): Observable<any> {
    const url = `${this.baseUrl}/LeaveRequestSet`;
    // Note: The Interceptor handles the CSRF Token automatically
    return this.http.post(url, payload);
  }
  // 7. SEND PAYSLIP EMAIL (POST)
  sendPayslipEmail(payload: { email: string; pdfContent: string; month: string; year: string }): Observable<any> {
    // Point to the local Node.js server we just created
    const url = 'http://localhost:3000/send-email';
    // Use the interceptor-free client to avoid sending SAP CSRF tokens to Node.js
    return this.httpWithoutInterceptors.post(url, payload);
  }
}