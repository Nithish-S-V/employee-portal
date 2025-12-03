import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Employee } from '../models/api.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  currentUser: any = null;
  employee: Employee | null = null;
  isLoading: boolean = true;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUserValue;
    if (this.currentUser?.Empid) {
      this.fetchProfile(this.currentUser.Empid);
    } else {
      this.router.navigate(['/login']);
    }
  }

  fetchProfile(empId: string) {
    this.isLoading = true;
    this.api.getEmployeeProfile(empId).subscribe({
      next: (res) => {
        this.employee = res.d;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // Helper for SAP Dates
  formatDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    try {
      if (typeof dateStr === 'string' && dateStr.includes('/Date(')) {
        const timestamp = parseInt(dateStr.replace(/\/Date\((-?\d+)\)\//, '$1'));
        return new Date(timestamp);
      }
    } catch(e) {}
    return new Date();
  }
}