import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  constructor(private http: HttpClient) {}

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
}