import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Needed for inputs
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { LeaveBalance, LeaveRequest } from '../models/api.models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-leave-mgt',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './leave-mgt.component.html',
  styleUrls: ['./leave-mgt.component.css']
})
export class LeaveMgtComponent implements OnInit {

  isLoading: boolean = true;
  currentUser: any = null;
  
  // Data Containers
  history: LeaveRequest[] = [];
  balances: LeaveBalance[] = [];

  // Form Data
  newLeave = {
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  };

  message: { type: 'success' | 'error', text: string } | null = null;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUserValue;
    if (this.currentUser?.Empid) {
      this.loadData(this.currentUser.Empid);
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadData(empId: string) {
    this.isLoading = true;
    
    forkJoin({
      hist: this.api.getLeaveHistory(empId),
      bal: this.api.getLeaveBalances(empId)
    }).subscribe({
      next: (res) => {
        // Handle History
        if (res.hist.d && res.hist.d.results) {
          this.history = res.hist.d.results;
        }
        
        // Handle Balances
        if (res.bal.d && res.bal.d.results) {
          this.balances = res.bal.d.results;
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    if (!this.newLeave.leaveType || !this.newLeave.startDate || !this.newLeave.endDate) {
      this.showMessage('error', 'Please fill all required fields');
      return;
    }

    this.isLoading = true;

    // Prepare Payload for OData
    const payload = {
      Pernr: this.currentUser.Empid,
      LeaveType: this.newLeave.leaveType,
      LeaveText: this.newLeave.reason || 'Web Request',
      // Convert HTML Date (YYYY-MM-DD) to SAP JSON Date format /Date(...)/ 
      // Note: For OData V2, we usually send the date object or specific string format.
      // For this demo, we will try sending the standard ISO string, hoping SAP accepts it,
      // OR we handle the conversion in ABAP.
      Begda: this.formatDateForSap(this.newLeave.startDate),
      Endda: this.formatDateForSap(this.newLeave.endDate),
      Status: 'Pending'
    };

    console.log('Sending Leave:', payload);

    this.api.applyLeave(payload).subscribe({
      next: () => {
        this.showMessage('success', 'Leave Request Submitted Successfully!');
        this.newLeave = { leaveType: '', startDate: '', endDate: '', reason: '' }; // Reset
        this.loadData(this.currentUser.Empid); // Refresh List
      },
      error: (err) => {
        console.error('Apply Error:', err);
        // Note: Since we didn't write CREATE logic in ABAP yet, this might fail with 405 or 501.
        // We will display a soft error.
        this.showMessage('error', 'Submission Failed. (Backend Logic may be missing).');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Helper: Convert YYYY-MM-DD to standard Date object for OData
  formatDateForSap(dateString: string): string {
    // Basic approach: Send ISO string. OData usually handles this or we adjust.
    return new Date(dateString).toISOString(); 
  }

  // Helper: Convert SAP /Date()/ to JS Date for Display
  parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    try {
      if (typeof dateStr === 'string' && dateStr.includes('/Date(')) {
        const timestamp = parseInt(dateStr.replace(/\/Date\((-?\d+)\)\//, '$1'));
        return new Date(timestamp);
      }
    } catch(e) {}
    return new Date();
  }

  showMessage(type: 'success' | 'error', text: string) {
    this.message = { type, text };
    setTimeout(() => {
        this.message = null; 
        this.cdr.detectChanges();
    }, 4000);
  }
}