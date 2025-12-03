import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- Import ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Employee, LeaveBalance } from '../models/api.models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  currentUser: any = null;
  profile: Employee | null = null;
  balances: LeaveBalance[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private auth: AuthService, 
    private api: ApiService, 
    private router: Router,
    private cdr: ChangeDetectorRef // <--- Use CDR instead of Zone
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUserValue;
    if (this.currentUser && this.currentUser.Empid) {
      this.loadAllData(this.currentUser.Empid);
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadAllData(empId: string) {
    this.isLoading = true;
    console.log('Starting Data Load...');

    forkJoin({
      profileReq: this.api.getEmployeeProfile(empId),
      balanceReq: this.api.getLeaveBalances(empId)
    }).subscribe({
      next: (results) => {
        console.log('Data Received, updating UI...');
        
        // 1. Assign Data
        this.profile = results.profileReq.d;
        
        if (results.balanceReq.d && results.balanceReq.d.results) {
            this.balances = results.balanceReq.d.results;
        }

        // 2. Stop Loading
        this.isLoading = false; 

        // 3. Force Angular to update screen
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error fetching data', err);
        this.isLoading = false;
        this.errorMessage = 'Data load failed. Check console.';
        this.cdr.detectChanges();
      }
    });
  }

  // Crash-proof Date Formatter
  formatSapDate(dateStr: any): Date {
    if (!dateStr) return new Date();
    // If it's already a date object
    if (dateStr instanceof Date) return dateStr;
    
    try {
      if (typeof dateStr === 'string' && dateStr.includes('/Date(')) {
        const timestamp = parseInt(dateStr.replace(/\/Date\((-?\d+)\)\//, '$1'));
        return new Date(timestamp);
      }
    } catch (e) { }
    return new Date();
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}